# 🎸 Chitara Pas cu Pas

Aplicație web (PWA) pentru învățat chitara **de la zero**, în limba română. Merge în browser pe telefon,
tabletă și calculator, se poate „instala” pe ecranul telefonului și funcționează și **offline**.

- **Curs structurat**: 21 de lecții pe 6 niveluri, fiecare cu explicație, diagramă SVG, sunet,
  exercițiu practic și mini-test. Lecția următoare se deblochează după ce o treci pe cea curentă.
- **Unelte**: acordor cu microfonul, metronom, bibliotecă de acorduri (36 de acorduri, cu variante),
  editor de progresii, jocul schimbărilor, test de auz, verificarea acordului cu microfonul,
  „one-minute change” cu grafic, cântece, rutină zilnică, sfaturi.
- **Simulator 3D**: chitară acustică stilizată (cartoon, low-poly) pe care vezi orice acord din 3 unghiuri,
  cu degetele animate, corzi care vibrează și o pană care urmează ritmul (vezi secțiunea de mai jos).
- **Gamificare**: XP, nivel de chitarist, serie de zile consecutive (🔥), 17 insigne.
- **Fără cont**: progresul se salvează în `localStorage`, pe dispozitiv.
- Temă **deschisă / întunecată / automată** și **mod pentru stângaci** (diagramele se oglindesc).

## Simulatorul 3D

Ecranul **Simulator** (în meniu) și comutatorul **2D / 3D** din lecții, din Biblioteca de acorduri
și din Editorul de progresii afișează acordurile pe o chitară 3D.

- **Model propriu**, construit doar din forme simple în Three.js (corp din curbe Bézier extrudate,
  grif conic, 19 taste la pozițiile reale, cap cu chei) – fără modele descărcate, fără mâini 3D.
  Stil „cartoon” (MeshToonMaterial cu 3 trepte de lumină), în culorile aplicației.
- **Aceleași date ca diagramele 2D**: pozițiile, degetele și barré-urile vin din `src/music/chords.ts`
  (inclusiv `findBarres`); culorile degetelor vin din aceleași variabile CSS (`--f1`…`--f4`).
- **Degetele**: buline colorate cu cifra 1–4 pe tastele corecte; la apariție cad pe rând, iar la
  schimbarea acordului se mută în arc spre noua poziție. Barré = bulină alungită peste corzi.
  „X” deasupra corzilor care nu se cântă, „O” pentru cele libere.
- **Corzile** vibrează (modul fundamental + armonica a doua, desenate între tastă și căluș) și se aprind
  când sună. Atinge o coardă pe model ca s-o auzi.
- **Pana** trece peste corzi în jos / în sus după modelul de strumming, inclusiv mișcările „în gol”.
- **Camera**: rotire, zoom și mutare cu degetul (OrbitControls, cu limite); butoane „Din perspectiva mea”,
  „Din față”, „De sus pe grif”, cu tranziție lină. Unghiurile apropiate se încadrează automat pe tastele
  folosite de acord (și pe barré-urile de sus de pe grif).
- **Mod stângaci**: modelul se oglindește (setarea din Profil), cifrele rămân lizibile.

### Cum rămâne sincronizat cu sunetul

`src/audio/events.ts` e un mic canal de evenimente: `playNote()` și `strum()` din `src/audio/guitar.ts`
anunță fiecare notă/lovitură cu momentul ei exact pe ceasul audio (aceleași momente programate de
metronom și de redarea progresiilor). Corzile și pana 3D doar ascultă și compară cu `AudioContext.currentTime`
(minus latența de ieșire), deci orice sunet din aplicație se vede automat pe model, fără cod duplicat.

### Performanță și revenirea la 2D

- Partea 3D (Three.js + React Three Fiber + drei) e într-un fișier separat, **încărcat doar când
  simulatorul apare pe ecran** (`React.lazy`); restul aplicației rămâne la fel de rapid.
- `frameloop="demand"`: se desenează doar când se mișcă ceva (în repaus: 0 cadre); randarea se oprește
  când simulatorul iese de pe ecran, iar după 8 s scena e demontată și contextul WebGL eliberat.
- Piesele statice ale chitarei sunt unite pe material (~14 apeluri de desenare pentru toată chitara),
  fără umbre, rezoluție maximă 1,75×, fără antialiasing pe ecranele foarte dense.
- **Revenire automată la diagrama 2D**, cu un mesaj prietenos, dacă: browserul nu are WebGL, dispozitivul
  e foarte slab (≤ 2 nuclee sau ≤ 2 GB RAM – cu opțiunea „Încearcă totuși 3D”), rularea e constant prea
  lentă (PerformanceMonitor), se pierde contextul WebGL sau partea 3D nu se poate încărca (ex. offline,
  înainte să fi fost descărcată vreodată).

Codul: `src/components/three/` (`Guitar3D.tsx` e componenta de folosit; `GuitarScene.tsx` e scena
încărcată la cerere; `geometry.ts` și `chordLayout.ts` sunt funcții pure pentru poziții).

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
- **Three.js + React Three Fiber + drei** pentru simulatorul 3D (încărcat la cerere)
- **Web Audio API**, fără fișiere audio și fără biblioteci audio externe:
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
    three/      simulatorul 3D (model, corzi, degete, pană, cameră, revenire la 2D)
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

- Simulatorul 3D a fost verificat în Chromium cu randare software (fără placă video); pe telefoane reale
  performanța depinde de dispozitiv – de aceea există revenirea automată la 2D.
- Recunoașterea acordurilor cu microfonul e intenționat simplă (chromagramă): merge bine într-o cameră
  liniștită, cu chitara acordată; nu e infailibilă.
- Toate datele rămân pe dispozitiv. Din Profil poți reseta progresul.
- Cântecele incluse sunt populare/tradiționale (domeniul public) sau compoziții originale.
