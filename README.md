# Laboratorul de Robotică

Laborator 3D interactiv de electronică și robotică, în browser: explorezi plăci de dezvoltare,
le desfaci și le lipești la loc, construiești circuite pe breadboard și le rulezi într-un simulator.

Fără backend. Toate modelele 3D și texturile sunt generate din cod; progresul se salvează în `localStorage`.

## Pornire

```bash
npm install
npm run dev      # server de dezvoltare
npm run build    # verificare de tipuri + build de producție în dist/
npm run preview  # servește build-ul
```

Adaugă `?debug` la adresă ca să ai în consolă `__lab` (starea aplicației și obiectele scenei).

## Stadiu

Proiectul se construiește în faze.

| Fază | Conținut | Stare |
| --- | --- | --- |
| 1 | Schelet, scena de birou, formatul de date, Raspberry Pi 4 și Arduino Uno R3, secțiunea Plăci | gata |
| 2 | Modul „Asamblează" | urmează |
| 3 | Restul plăcilor (până la 16) | urmează |
| 4 | Banc de lucru: breadboard, componente, fire, simulator electric | urmează |
| 5 | Editor de cod, interpretor Arduino, proiecte gata făcute | urmează |
| 6 | Lecții, Quiz, Compară, Lofi, sunete | urmează |
| 7 | Optimizare, testare pe telefon, finisaje | urmează |

## Structură

```
src/
  texte.ts               toate textele interfeței (română)
  data/
    types.ts             formatul de date al unei plăci
    boards/*.ts          câte un fișier pe placă: specificații, PCB, componente, pini, ordine de asamblare
  three/                 tot ce e 3D și nu depinde de React
    parts/               modele procedurale: cipuri, conectori, headere, pasive
    pcb/                 geometria PCB-ului și „pictorul" care îi desenează fețele pe canvas
    buildBoard.ts        asamblează o placă întreagă dintr-un fișier de date
    props.ts             biroul, covorașul de tăiere și recuzita
    env.ts               mediul de reflexie (fără imagini HDR)
    outline.ts           conturul pieselor evidențiate
    thumbnails.ts        miniaturile din carusel
  scene/                 Canvas-ul comun, lumini, cameră
  sections/boards/       secțiunea „Plăci": scenă + interfață
  state/                 stare (Zustand); `progress.ts` e singurul persistat
  ui/                    navigare și elemente comune
  lib/resistor.ts        codul culorilor pentru rezistențe
```

## Cum adaugi o placă

1. Creează `src/data/boards/<id>.ts` care exportă un `BoardSpec` (vezi `types.ts`).
2. Adaug-o în lista din `src/data/boards/index.ts`.

Cotele sunt în milimetri, cu originea în colțul stânga-jos al PCB-ului privit de sus. Fiecare componentă
alege un model din `src/three/parts` prin câmpul `model.kind`; pad-urile și silkscreen-ul ei se desenează
singure pe textura plăcii.

## Despre date

Specificațiile din fișierele de date (microcontroler, memorie, tensiuni, pinout) urmează documentația
publică a plăcilor. Conturul plăcii, găurile de montaj și axele conectorilor urmează desenele mecanice;
pozițiile cipurilor și ale pieselor mărunte sunt aproximate și au rol pur vizual. Ce nu a putut fi
confirmat este marcat în cod cu `TODO`.

Denumirile de produse și de firme apar doar ca text. Nu sunt folosite logo-uri, modele sau imagini descărcate.
