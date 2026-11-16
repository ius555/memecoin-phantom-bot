import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { getBoard } from '../../data/boards';
import { useApp } from '../../state/app';
import { useProgress } from '../../state/progress';
import { stage, useStage } from '../../state/stage';
import { buildBoard, type BoardModel } from '../../three/buildBoard';
import { createOutline, makeOutlineMaterial } from '../../three/outline';
import { softShadowTexture } from '../../three/textures';
import { useFind } from './find';
import { LabelsDriver } from './LabelsDriver';

/** Cât stă placa deasupra covorașului: se sprijină pe vârfurile pinilor. */
const STANDOFF = 2.6;

// ───────────────────────── memorie de modele ─────────────────────────

const cache = new Map<string, BoardModel>();
const inUse = new Set<BoardModel>();
const MAX_CACHED = 3;

function acquire(id: string): BoardModel {
  let m = cache.get(id);
  if (m) cache.delete(id);
  else m = buildBoard(getBoard(id));
  cache.set(id, m); // cel mai recent folosit ajunge la coadă
  inUse.add(m);
  return m;
}

function release(m: BoardModel) {
  inUse.delete(m);
  for (const [id, model] of cache) {
    if (cache.size <= MAX_CACHED) break;
    if (inUse.has(model)) continue;
    cache.delete(id);
    model.dispose();
  }
}

// ───────────────────────── contururi de evidențiere ─────────────────────────

type OutlineKind = 'hover' | 'selected' | 'ok' | 'bad';
const outlineMats: Record<OutlineKind, THREE.ShaderMaterial> = {
  hover: makeOutlineMaterial('#ffffff', 2.4),
  selected: makeOutlineMaterial('#ffcf3f', 3),
  ok: makeOutlineMaterial('#35d07f', 3.4),
  bad: makeOutlineMaterial('#ff5247', 3.4),
};

class Outlines {
  private made = new Map<string, { group: THREE.Group; kind: OutlineKind }>();
  constructor(private model: BoardModel) {}

  sync(want: Map<string, OutlineKind>) {
    for (const [id, o] of this.made) if (!want.has(id)) o.group.visible = false;
    for (const [id, kind] of want) {
      const part = this.model.parts.get(id);
      if (!part) continue;
      let o = this.made.get(id);
      if (!o) {
        const group = createOutline(part.def.object, outlineMats[kind]);
        part.def.object.add(group);
        this.made.set(id, (o = { group, kind }));
      } else if (o.kind !== kind) {
        o.group.traverse((c) => {
          if ((c as THREE.Mesh).isMesh) (c as THREE.Mesh).material = outlineMats[kind];
        });
        o.kind = kind;
      }
      o.group.visible = true;
    }
  }

  clear() {
    for (const o of this.made.values()) o.group.removeFromParent();
    this.made.clear();
  }
}

// ───────────────────────── o placă pe birou ─────────────────────────

interface Slot {
  key: number;
  model: BoardModel;
  dir: number;
  leaving: boolean;
  first: boolean;
}

const easeOut = (t: number) => 1 - (1 - t) ** 3;
const easeIn = (t: number) => t * t * t;

let shadowMat: THREE.MeshBasicMaterial | null = null;
const pinRingGeo = new THREE.RingGeometry(1.25, 1.75, 4, 1, Math.PI / 4);
pinRingGeo.rotateX(-Math.PI / 2);
const pinRingMat = new THREE.MeshBasicMaterial({ color: '#ffffff', toneMapped: false, depthTest: false, transparent: true });

function partOf(o: THREE.Object3D): string | null {
  return (o.userData.partId as string | undefined) ?? null;
}

function BoardSlot({ slot, onGone }: { slot: Slot; onGone: (s: Slot) => void }) {
  const { model } = slot;
  const mover = useRef<THREE.Group>(null!);
  const flipper = useRef<THREE.Group>(null!);
  const shadow = useRef<THREE.Mesh>(null!);
  const tIn = useRef(0);
  const tOut = useRef(0);
  const flip = useRef(0);
  const gone = useRef(false);
  const active = !slot.leaving;

  const outlines = useMemo(() => new Outlines(model), [model]);
  const pinRing = useMemo(() => {
    const m = new THREE.Mesh(pinRingGeo, pinRingMat);
    m.renderOrder = 10;
    m.raycast = () => {};
    m.visible = false;
    return m;
  }, []);

  const hoverId = useApp((s) => s.hoverId);
  const touchId = useApp((s) => s.touchId);
  const selectedId = useApp((s) => s.selectedId);
  const pinout = useApp((s) => s.pinout);
  const pinHover = useApp((s) => s.pinHover);
  const feedback = useFind((s) => s.feedback);
  const [flash, setFlash] = useState<{ id: string; kind: 'ok' | 'bad'; at: number } | null>(null);

  if (!shadowMat) {
    shadowMat = new THREE.MeshBasicMaterial({ map: softShadowTexture(), transparent: true, depthWrite: false, toneMapped: false, opacity: 0.55 });
  }

  // legătura cu restul aplicației (camera și etichetele citesc de aici)
  useEffect(() => {
    if (!active) return;
    const g = flipper.current;
    stage.boardGroup = g;
    return () => {
      if (stage.boardGroup === g) stage.boardGroup = null;
    };
  }, [active]);

  useEffect(() => {
    inUse.add(model);
    return () => {
      outlines.clear();
      pinRing.removeFromParent();
      model.setPinout(false);
      for (const p of model.parts.values()) p.object.position.copy(p.home.position);
      release(model);
    };
  }, [model, outlines, pinRing]);

  // răspunsul vizual al jocului: contur verde / roșu pentru scurt timp
  useEffect(() => {
    if (!feedback || !active) return;
    setFlash({ id: feedback.partId, kind: feedback.kind, at: feedback.at });
    const t = setTimeout(() => setFlash(null), 900);
    return () => clearTimeout(t);
  }, [feedback, active]);

  useEffect(() => {
    const want = new Map<string, OutlineKind>();
    if (active) {
      if (selectedId) want.set(selectedId, 'selected');
      const h = hoverId ?? touchId;
      if (h && !want.has(h)) want.set(h, 'hover');
      if (flash) want.set(flash.id, flash.kind);
    }
    outlines.sync(want);
  }, [active, hoverId, touchId, selectedId, flash, outlines]);

  useEffect(() => {
    model.setPinout(active && pinout);
  }, [model, active, pinout]);

  // inelul alb din jurul pinului indicat
  useEffect(() => {
    const part = active && pinout && pinHover ? model.parts.get(pinHover.partId) : null;
    const slotPos = part?.def.pinSlots?.at[pinHover!.index];
    if (!part || !slotPos) {
      pinRing.visible = false;
      return;
    }
    part.object.add(pinRing);
    pinRing.position.set(slotPos[0], part.def.pinSlots!.y + 0.05, -slotPos[1]);
    pinRing.visible = true;
  }, [model, active, pinout, pinHover, pinRing]);

  useFrame((_, dt) => {
    const d = Math.min(dt, 0.1);
    if (slot.first) tIn.current = 1;
    else if (tIn.current < 1) tIn.current = Math.min(1, tIn.current + d / 0.85);
    if (slot.leaving && tOut.current < 1) tOut.current = Math.min(1, tOut.current + d / 0.5);
    const a = 1 - easeOut(tIn.current);
    const b = easeIn(tOut.current);
    // placa veche e ridicată de pe birou într-o parte, cea nouă coboară din cealaltă
    mover.current.position.set(slot.dir * 150 * a - slot.dir * 150 * b, 240 * a * a + 240 * b, -40 * a - 40 * b);
    mover.current.rotation.z = -slot.dir * 0.5 * a + slot.dir * 0.5 * b;
    mover.current.rotation.y = slot.dir * 0.7 * a - slot.dir * 0.7 * b;

    // întoarcerea pentru vederea „Jos"
    const wantFlip = active && useApp.getState().view === 'jos' ? 1 : 0;
    flip.current += (wantFlip - flip.current) * (1 - Math.exp(-d * 5.5));
    if (Math.abs(wantFlip - flip.current) < 0.0005) flip.current = wantFlip;
    const f = flip.current;
    const halfW = model.spec.pcb.w / 2;
    flipper.current.rotation.z = f * Math.PI;
    flipper.current.position.y = STANDOFF + model.thickness + Math.sin(f * Math.PI) * halfW * 0.85 + f * (model.height - STANDOFF + 0.4);
    if (active) stage.flip = f;

    // umbra moale de contact slăbește când placa se ridică
    const lift = mover.current.position.y + flipper.current.position.y - (STANDOFF + model.thickness);
    (shadow.current.material as THREE.MeshBasicMaterial).opacity = 0.55 * Math.max(0, 1 - lift / 60);
    shadow.current.position.x = mover.current.position.x;
    shadow.current.position.z = mover.current.position.z;

    // tremurat scurt la un răspuns greșit
    if (flash?.kind === 'bad') {
      const part = model.parts.get(flash.id);
      if (part) {
        const p = Math.min(1, (performance.now() - flash.at) / 420);
        part.object.position.x = part.home.position.x + Math.sin(p * 34) * 0.7 * (1 - p);
      }
    }
    if (pinRing.visible) pinRingMat.opacity = 0.65 + Math.sin(performance.now() * 0.007) * 0.35;

    if (slot.leaving && tOut.current >= 1 && !gone.current) {
      gone.current = true;
      onGone(slot);
    }
  });

  // ── interacțiune ──
  const local = useMemo(() => new THREE.Vector3(), []);
  const pinUnder = (e: ThreeEvent<PointerEvent | MouseEvent>, id: string) =>
    model.pinAt(id, flipper.current.worldToLocal(local.copy(e.point)));

  const onMove = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (e.nativeEvent.pointerType === 'touch' || e.nativeEvent.buttons !== 0) return;
    const app = useApp.getState();
    const id = partOf(e.object);
    app.setHover(id);
    if (app.pinout) {
      const pin = id ? pinUnder(e, id) : -1;
      app.setPinHover(pin >= 0 && id ? { partId: id, index: pin } : null);
    }
  };

  const onOut = (e: ThreeEvent<PointerEvent>) => {
    if (e.nativeEvent.pointerType === 'touch') return;
    const app = useApp.getState();
    app.setHover(null);
    if (app.pinout) app.setPinHover(null);
  };

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (e.delta > 6) return;
    const app = useApp.getState();
    const find = useFind.getState();
    const id = partOf(e.object);
    if (find.phase === 'play') {
      if (id) find.guess(id);
      return;
    }
    if (find.phase !== 'off') return;
    if (app.pinout && id) {
      const pin = pinUnder(e, id);
      if (pin >= 0) {
        app.setPinHover({ partId: id, index: pin });
        return;
      }
    }
    if (!id) {
      app.select(null);
      app.setTouch(null);
      return;
    }
    const touch = (e.nativeEvent as PointerEvent).pointerType === 'touch';
    if (touch && app.touchId !== id && app.selectedId !== id) {
      app.setTouch(id);
      return;
    }
    app.select(id);
  };

  const { w, h } = model.spec.pcb;
  return (
    <>
      <mesh ref={shadow} rotation-x={-Math.PI / 2} position-y={0.12} material={shadowMat} raycast={() => null}>
        <planeGeometry args={[w * 1.42, h * 1.5]} />
      </mesh>
      <group ref={mover}>
        <group ref={flipper}>
          {active ? (
            <primitive object={model.root} onPointerMove={onMove} onPointerOut={onOut} onClick={onClick} />
          ) : (
            <primitive object={model.root} />
          )}
        </group>
      </group>
    </>
  );
}

// ───────────────────────── scena secțiunii „Plăci" ─────────────────────────

let seq = 0;

export default function BoardsScene() {
  const boardId = useApp((s) => s.boardId);
  const [slots, setSlots] = useState<Slot[]>([]);

  useEffect(() => {
    const model = acquire(boardId);
    const dir = useApp.getState().boardDir;
    setSlots((prev) => [
      ...prev.filter((s) => s.model !== model).map((s) => (s.leaving ? s : { ...s, leaving: true, dir })),
      { key: ++seq, model, dir, leaving: false, first: prev.length === 0 },
    ]);
    stage.model = model;
    useStage.getState().setFit({ radius: model.radius, height: model.height });
    useProgress.getState().markSeen(boardId);
    useApp.getState().setReady();
  }, [boardId]);

  useEffect(
    () => () => {
      stage.model = null;
    },
    [],
  );

  const remove = useCallback((s: Slot) => setSlots((prev) => prev.filter((x) => x.key !== s.key)), []);

  return (
    <>
      {slots.map((s) => (
        <BoardSlot key={s.key} slot={s} onGone={remove} />
      ))}
      <LabelsDriver />
    </>
  );
}
