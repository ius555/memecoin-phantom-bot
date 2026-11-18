/**
 * Canal de evenimente pentru sunetele de chitară.
 *
 * Fiecare notă și fiecare lovitură de strum programată anunță aici CE se cântă și CÂND
 * (pe ceasul audio). Oricine vrea să "vadă" sunetul – de exemplu simulatorul 3D, care
 * face corzile să vibreze și mișcă pana – doar ascultă, fără să știe cine a produs sunetul.
 * Așa animațiile rămân sincronizate cu metronomul și cu redarea, dintr-o singură sursă.
 */
export type GuitarEvent =
  | { type: 'note'; string: number; fret: number; when: number; velocity: number }
  | {
      type: 'strum'
      direction: 'down' | 'up'
      strings: number[]
      when: number
      spread: number
      /** mâna trece pe lângă corzi fără să le lovească (sloturile „-” din modelele de strumming) */
      ghost?: boolean
    }

type Listener = (e: GuitarEvent) => void
const listeners = new Set<Listener>()

export function onGuitarEvent(fn: Listener): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function emitGuitarEvent(e: GuitarEvent) {
  listeners.forEach((fn) => fn(e))
}
