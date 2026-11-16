import { useApp } from '../../state/app';
import { useLayout } from '../../ui/useLayout';
import { BoardCard } from './BoardCard';
import { Dock } from './Dock';
import { useFind } from './find';
import { FindHud } from './FindHud';
import { LabelsLayer, Tooltip } from './LabelsLayer';
import { DetailPanel, PinoutPanel } from './Panels';

/** Interfața secțiunii „Plăci", așezată peste scena 3D. */
export default function BoardsUI() {
  const playing = useFind((s) => s.phase === 'play');
  const sheet = useApp((s) => s.selectedId !== null || s.pinout);
  const layout = useLayout();
  return (
    <>
      <LabelsLayer />
      {/* pe telefon, panoul jocului sau foaia de jos iau locul cardului, ca placa să rămână vizibilă */}
      {!(layout.mobile && (playing || sheet)) && <BoardCard />}
      <Dock />
      <PinoutPanel />
      <DetailPanel />
      <FindHud />
      <Tooltip />
    </>
  );
}
