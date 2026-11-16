import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useApp } from '../../state/app';
import { stage, useStage } from '../../state/stage';
import { useFind } from './find';
import { overlay, type LabelEntry } from './overlay';

interface Item {
  entry: LabelEntry;
  sx: number;
  sy: number;
}

const clamp = (v: number, a: number, b: number) => Math.min(Math.max(v, a), Math.max(a, b));

/**
 * Așază etichetele HTML în două coloane, în stânga și în dreapta plăcii, și trage
 * liniile de legătură până la piese. Rulează la fiecare cadru și scrie direct în DOM.
 */
export function LabelsDriver() {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const v = useMemo(() => new THREE.Vector3(), []);
  const wasShown = useRef(false);

  useFrame((_, dt) => {
    const model = stage.model;
    const g = stage.boardGroup;
    const app = useApp.getState();
    const W = size.width;
    const H = size.height;
    if (g) g.updateWorldMatrix(true, false);

    const project = (p: THREE.Vector3) => {
      v.copy(p).applyMatrix4(g!.matrixWorld).project(camera);
      return [(v.x * 0.5 + 0.5) * W, (-v.y * 0.5 + 0.5) * H, v.z] as const;
    };

    // tooltip-ul ancorat de piesa atinsă
    const tip = overlay.touchTip;
    if (tip) {
      const part = app.touchId && model && g ? model.parts.get(app.touchId) : null;
      if (part) {
        const [x, y] = project(part.anchor);
        tip.style.transform = `translate(${clamp(x, 90, W - 90).toFixed(1)}px, ${Math.max(70, y - 14).toFixed(1)}px) translate(-50%, -100%)`;
        tip.style.opacity = '1';
      } else {
        tip.style.opacity = '0';
      }
    }

    const show = app.labels && app.section === 'placi' && useFind.getState().phase === 'off' && !!model && !!g;
    if (!show) {
      if (wasShown.current) {
        for (const e of overlay.labels.values()) {
          e.el.style.opacity = '0';
          e.el.style.pointerEvents = 'none';
          e.path.style.opacity = '0';
          e.dot.style.opacity = '0';
          e.placed = false;
        }
        wasShown.current = false;
      }
      return;
    }
    wasShown.current = true;

    const items: Item[] = [];
    const flipped = stage.flip > 0.5;
    for (const [id, entry] of overlay.labels) {
      const part = model!.parts.get(id);
      let ok = false;
      if (part && part.bottom === flipped) {
        const [sx, sy, sz] = project(part.anchor);
        if (sz < 1) {
          items.push({ entry, sx, sy });
          ok = true;
        }
      }
      if (!ok) {
        entry.el.style.opacity = '0';
        entry.el.style.pointerEvents = 'none';
        entry.path.style.opacity = '0';
        entry.dot.style.opacity = '0';
        entry.placed = false;
      }
    }
    if (!items.length) return;

    const mobile = W < 768;
    let minX = Infinity;
    let maxX = -Infinity;
    for (const it of items) {
      minX = Math.min(minX, it.sx);
      maxX = Math.max(maxX, it.sx);
    }
    const cx = (minX + maxX) / 2;
    for (const it of items) {
      const side = it.sx < cx ? -1 : 1;
      // histerezis: o etichetă își schimbă coloana doar dacă piesa a trecut clar de mijloc
      if (!it.entry.placed || Math.abs(it.sx - cx) > 22) it.entry.side = side;
    }

    // ecran scund (telefon pe orizontală): cardul stă în stânga, caruselul lipsește
    const short = H < 520 && !mobile;
    const bottom = H - (short ? 62 : mobile ? 150 : 176);
    const k = 1 - Math.exp(-dt * 14);
    for (const side of [-1, 1] as const) {
      const list = items.filter((it) => it.entry.side === side).sort((a, b) => a.sy - b.sy);
      const n = list.length;
      if (!n) continue;
      // pe ecrane late doar coloana din stânga trebuie să ocolească cardul plăcii
      const card = useStage.getState().cardBottom || 60;
      const top = short ? 62 : mobile || side < 0 ? card + 6 : 84;
      const step = clamp((bottom - top) / n, mobile || short ? 16 : 22, mobile || short ? 23 : 32);
      let mid = 0;
      let wMax = 0;
      for (const it of list) {
        mid += it.sy / n;
        wMax = Math.max(wMax, it.entry.el.offsetWidth);
      }
      const span = step * (n - 1);
      const y0 = clamp(mid - span / 2, top + 10, bottom - 10 - span);
      const gap = mobile ? 10 : short ? 18 : 46;
      const leftMin = short ? 296 : 0;
      // cu panoul din dreapta deschis, coloana din dreapta rămâne în stânga lui
      const rightEdge = !mobile && (app.selectedId || app.pinout) ? W - (short ? 344 : 426) : W - 6;
      const colX = side < 0 ? Math.max(wMax + 6 + leftMin, minX - gap) : Math.min(rightEdge - wMax, maxX + gap);
      list.forEach((it, i) => {
        const e = it.entry;
        const ty = y0 + i * step;
        e.y = e.placed ? e.y + (ty - e.y) * k : ty;
        e.placed = true;
        e.el.style.transform =
          side < 0
            ? `translate(${colX.toFixed(1)}px, ${e.y.toFixed(1)}px) translate(-100%, -50%)`
            : `translate(${colX.toFixed(1)}px, ${e.y.toFixed(1)}px) translate(0, -50%)`;
        e.el.style.opacity = '1';
        e.el.style.pointerEvents = 'auto';
        const x1 = colX + (side < 0 ? 3 : -3);
        const x2 = colX + (side < 0 ? 12 : -12);
        e.path.setAttribute('d', `M${x1.toFixed(1)} ${e.y.toFixed(1)}L${x2.toFixed(1)} ${e.y.toFixed(1)}L${it.sx.toFixed(1)} ${it.sy.toFixed(1)}`);
        e.path.style.opacity = '1';
        e.dot.setAttribute('cx', it.sx.toFixed(1));
        e.dot.setAttribute('cy', it.sy.toFixed(1));
        e.dot.style.opacity = '1';
      });
    }
  });

  return null;
}
