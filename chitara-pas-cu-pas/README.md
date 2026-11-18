# 🎸 Chitara Pas cu Pas

Aplicație web (PWA) pentru învățat chitara **de la zero**, în limba română. Merge în browser pe telefon,
tabletă și calculator, se poate „instala” pe ecranul telefonului și funcționează și **offline**.

- **Curs structurat**: 21 de lecții pe 6 niveluri, fiecare cu explicație, diagramă SVG, sunet,
  exercițiu practic și mini-test. Lecția următoare se deblochează după ce o treci pe cea curentă.
- **Unelte**: acordor cu microfonul, metronom, bibliotecă de acorduri (36 de acorduri, cu variante),
  editor de progresii, jocul schimbărilor, test de auz, verificarea acordului cu microfonul,
  „one-minute change” cu grafic, cântece, rutină zilnică, sfaturi.
- **Gamificare**: XP, nivel de chitarist, serie de zile consecutive (🔥), 17 insigne.
- **Fără cont**: progresul se salvează în `localStorage`, pe dispozitiv.
- Temă **deschisă / întunecată / automată** și **mod pentru stângaci** (diagramele se oglindesc).

## Cerințe

- [Node.js](https://nodejs.org/) 20 sau mai nou (testat cu Node 22)
- npm (vine cu Node.js)

## Instalare și rulare

```bash
cd chitara-pas-cu-pas
npm install        # instalează dependențele
npm run dev        # pornește serverul de dezvoltare → http://localhost:5173
```

Deschide adresa afișată în browser. Pentru a încerca pe telefon în aceeași rețea Wi-Fi:

```bash
npm run dev -- --host   # afișează și adresa din rețea, ex. http://192.168.1.20:5173
```

> **Microfonul** (acordorul, verificarea acordului, jocul în modul microfon) funcționează doar pe
> `https://` sau pe `localhost`. Pe telefon, prin adresa de rețea `http://192.168...`, browserul
> blochează microfonul – folosește build-ul publicat pe un hosting cu https (vezi mai jos).

## Build de producție

```bash
npm run build      # verifică tipurile (TypeScript) și creează folderul dist/
npm run preview    # servește build-ul local → http://localhost:4173
```

Folderul `dist/` e un site static: îl poți publica pe orice hosting (GitHub Pages, Netlify, Vercel,
Cloudflare Pages...). Aplicația folosește rute cu `#` și căi relative, deci merge și dintr-un subfolder,
fără configurare de server. Service worker-ul (`public/sw.js`) păstrează aplicația pentru folosire offline.

### Instalare pe telefon (PWA)

Deschide site-ul publicat (https) în Chrome (Android) sau Safari (iPhone):
- **Android**: meniul ⋮ → „Adaugă pe ecranul de pornire” / „Instalează aplicația”
- **iPhone**: butonul Partajare → „Adaugă pe ecranul principal”

## Tehnologii

- **React 19 + TypeScript + Vite**
- **Tailwind CSS 4** (culorile sunt tokenuri CSS în `src/index.css`, pentru tema deschisă/întunecată)
- **Web Audio API**, fără fișiere audio și fără biblioteci externe:
  - sunetul de chitară e sintetizat cu algoritmul **Karplus-Strong** (`src/audio/guitar.ts`)
  - metronomul și redarea ritmurilor folosesc un ceas audio precis cu „lookahead” (`src/audio/scheduler.ts`)
  - acordorul detectează frecvența cu metoda **McLeod (MPM)** (`src/audio/pitch.ts`)
  - recunoașterea acordurilor folosește o **chromagramă** comparată cu șabloane (`src/audio/chroma.ts`)
- Diagramele de acorduri, grifurile, tabulatoarele și ilustrațiile sunt desenate în **SVG**.

## Structura proiectului

Vezi [ARCHITECTURE.md](./ARCHITECTURE.md) pentru detalii. Pe scurt:

```
src/
  audio/        sinteză, metronom, microfon, acordor, chromagramă
  music/        teorie, acorduri, ritmuri, fingerpicking, progresii, cântece, tab
  data/         lecțiile (pe niveluri), insigne, sfaturi, rutine
  store/        progres, setări, notificări (localStorage)
  hooks/        useClock, usePlayAlong, useChordListener, usePracticeTracker
  components/   diagramă de acord, grif, tab, metronom, acordor, widget-uri de lecție...
  pages/        câte o pagină pe rută
```

## Cum adaugi conținut

### O lecție nouă

Deschide fișierul nivelului, de ex. `src/data/lessons/level2.ts`, și adaugă un obiect în `lessons`:

```ts
{
  id: 'acordul-b7',                 // unic, apare în adresă: #/curs/acordul-b7
  title: 'Acordul B7',
  summary: 'Un acord cu patru degete.',
  minutes: 10,
  blocks: [
    { type: 'text', text: 'Text cu **bold**.\n\n- listă\n- cu puncte' },
    { type: 'chords', chords: ['B7', 'E'], caption: 'Atinge pentru sunet' },
    { type: 'tab', title: 'Exercițiu', bpm: 70, tab: `
e|-0---2---|
B|---------|
G|---------|
D|---------|
A|---------|
E|---------|` },
    { type: 'widget', widget: 'metronome' },
    { type: 'exercise', title: 'Exersează', steps: ['Pasul 1', 'Pasul 2'], minutes: 3 },
    { type: 'tip', text: 'Un sfat', tone: 'info' },
  ],
  quiz: [
    { q: 'Întrebarea?', options: ['A', 'B', 'C'], answer: 1, explain: 'De ce.', chord: 'B7' },
  ],
}
```

Ordinea din fișiere = ordinea de deblocare. Widget-urile disponibile sunt listate în
`src/data/lessons/types.ts` (`WidgetName`) și înregistrate în `src/components/lesson/WidgetBlock.tsx`.
Un nivel nou se adaugă în `src/data/lessons/index.ts`; insigna lui apare automat.

### Un acord nou

În `src/music/chords.ts`: `c('B7', shape('x21202', '021304'))` – tastele de la coarda 6 la coarda 1
(`x` = nu se cântă), apoi degetele (0 = niciunul). Barré-ul se detectează automat.

### Un cântec nou

În `src/music/songs.ts`, cu acordurile între paranteze pătrate înaintea silabei: `'[C]Hai să dăm [G]mână'`.
Folosește **doar** cântece din domeniul public sau compoziții proprii.

### Insigne, sfaturi, rutine

`src/data/badges.ts`, `src/data/tips.ts`, `src/data/routines.ts`.

## Note

- Recunoașterea acordurilor cu microfonul e intenționat simplă (chromagramă): merge bine într-o cameră
  liniștită, cu chitara acordată; nu e infailibilă.
- Toate datele rămân pe dispozitiv. Din Profil poți reseta progresul.
- Cântecele incluse sunt populare/tradiționale (domeniul public) sau compoziții originale.
