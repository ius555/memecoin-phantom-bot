# Chitara Pas cu Pas – plan de arhitectură

Aplicație PWA (React + TypeScript + Vite + Tailwind CSS) pentru învățat chitara de la zero, în limba română.
Totul rulează în browser, fără server și fără cont: progresul stă în `localStorage`.

## Principii

- **Mobil întâi**: navigare jos cu 5 secțiuni, butoane mari (min. 44 px), text clar.
- **Design propriu**: culori calde (lemn, verde salvie, crem), temă deschisă/întunecată, fără mâini 3D.
- **Date separate de cod**: lecțiile, acordurile, cântecele și ritmurile sunt fișiere TS în `src/data` și `src/music`.
  O lecție nouă = un obiect nou într-un fișier de nivel.
- **Audio fără sample-uri externe**: sinteză Karplus-Strong în Web Audio API (`src/audio/guitar.ts`),
  deci aplicația merge și offline.

## Structura folderelor

```
src/
  main.tsx               punct de intrare, înregistrează service worker-ul
  App.tsx                rutele (HashRouter – merge pe orice hosting static)
  index.css              Tailwind + tokenurile de culoare (temă deschisă/întunecată)

  audio/
    context.ts           AudioContext partajat (se deblochează la prima atingere)
    guitar.ts            sinteză Karplus-Strong: notă, acord, strum (jos/sus)
    scheduler.ts         ceas precis cu "lookahead" (metronom, ritmuri, progresii, joc)
    clicks.ts            sunetul de metronom
    pitch.ts             detectarea frecvenței (autocorelație) pentru acordor
    chroma.ts            chromagramă + potrivire cu șabloane de acorduri (recunoaștere)
    mic.ts               acces la microfon

  music/
    theory.ts            note, frecvențe, acordajul standard, transpunere
    chords.ts            biblioteca de acorduri (poziții, degete, variante)
    strumming.ts         modele de strumming (D-DU-UDU etc.)
    tab.ts               citirea tabulatoarelor ASCII
    progressions.ts      progresii celebre (I–V–vi–IV ...) în mai multe tonalități
    fingerpicking.ts     modele p-i-m-a
    songs.ts             cântece populare românești + compoziții originale

  data/
    lessons/types.ts     tipurile pentru lecții (blocuri de conținut, test)
    lessons/level0..5.ts conținutul lecțiilor, pe niveluri
    lessons/index.ts     lista tuturor nivelurilor + helperi
    badges.ts            insignele
    tips.ts              sfaturi pentru probleme frecvente
    routines.ts          rutinele zilnice 10/20/30 min

  hooks/
    useClock.ts          ceasul audio precis, ca hook React
    usePlayAlong.ts      motorul de acompaniament (acorduri + strumming/fingerpicking + metronom)
    useChordListener.ts  microfon → chromagramă netezită
    usePracticeTracker.ts timpul de practică (pentru streak)

  store/
    progress.tsx         context React: lecții terminate, XP, streak, insigne, istoric
    settings.tsx         context React: temă, mod stângaci, volum
    storage.ts           citire/scriere sigură în localStorage

  components/            componente reutilizabile
    ChordDiagram.tsx     diagramă SVG animată (degete 1–4 colorate, oglindire stângaci)
    Fretboard.tsx        grif orizontal SVG (game, note)
    TabView.tsx          tabulator SVG
    GuitarAnatomy.tsx    chitara interactivă (atingi o parte → explicație)
    Metronome.tsx, Tuner.tsx, StrumPattern.tsx, OneMinuteChange.tsx,
    PickingPatternView.tsx, ProgressionPlayer.tsx, Quiz.tsx, ...
    widgets/             widget-urile lecțiilor (chitara interactivă, postură, barré, pentatonică...)
    lesson/              afișarea blocurilor unei lecții
    layout/              antet, navigarea de jos

  pages/                 câte o pagină pe rută
```

## Modelul unei lecții

```ts
{
  id: 'em-am',
  title: 'Primele acorduri: Em și Am',
  summary: '...',
  minutes: 10,
  blocks: [                     // conținutul, în ordine
    { type: 'text', text: '...' },
    { type: 'chords', chords: ['Em', 'Am'] },
    { type: 'widget', widget: 'metronome' },
    { type: 'exercise', title: '...', steps: ['...'] },
  ],
  quiz: [ { q: '...', options: ['...'], answer: 1, explain: '...' } ],
}
```

Deblocare: lecția *n* se deschide după ce lecția *n−1* e terminată (test trecut cu ≥ 2/3).
Termini toate lecțiile unui nivel → insignă.

## Etape de implementare

1. Structura, tema, navigarea, stocarea progresului
2. Diagrama de acord SVG + motorul audio
3. Primele 5 lecții complete (Nivelul 0) – inclusiv chitara interactivă
4. Metronom și acordor (microfon)
5. Restul lecțiilor + biblioteca, editorul de progresii, jocul, testul de auz,
   recunoașterea acordurilor, cântece, gamificare, rutine, sfaturi, PWA

## Verificare

La fiecare etapă aplicația a fost compilată (`npm run build`) și verificată în Chromium (Playwright),
la dimensiunea unui telefon: fără erori în consolă, capturi de ecran pe teme deschisă/întunecată.
Audio și microfonul au fost testate cu semnale sintetizate:
- detectorul de frecvență, pe notele sintetizate ale celor 6 corzi: eroare 0 cenți;
- acordorul, cu un fișier WAV dat browserului ca „microfon” (A la 108 Hz → „prea jos, −32 cenți”);
- recunoașterea acordurilor: C recunoscut ca C, Am ca Am, iar C cântat când ținta e Am → „lipsește nota A”.
