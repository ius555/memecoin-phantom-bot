/** Sfaturi pentru problemele frecvente ale începătorilor. */
export interface Tip {
  id: string
  icon: string
  title: string
  items: string[]
}

export const TIPS: Tip[] = [
  {
    id: 'dureri-degete',
    icon: '🩹',
    title: 'Mă dor vârfurile degetelor',
    items: [
      'Este normal în primele 2–3 săptămâni. Pe vârfurile degetelor se formează treptat o piele mai groasă (bătături) și durerea dispare.',
      'Exersează des, dar puțin: 3 sesiuni de 10 minute sunt mai bune decât o sesiune de o oră.',
      'Apasă doar cât e nevoie ca nota să sune curat. Încearcă să slăbești apăsarea până începe să bâzâie, apoi apasă un pic mai tare – acela e punctul corect.',
      'Dacă ai corzi de metal foarte tari, cere la magazin corzi „light” (subțiri) sau o reglare a chitarei (corzi mai joase deasupra grifului).',
      'Nu exersa cu degetele ude (imediat după duș): pielea înmuiată se rănește mai ușor.',
      'Dacă apare o băşică sau durere ascuțită, ia o pauză de o zi. Durerea în încheieturi NU este normală – oprește-te.',
    ],
  },
  {
    id: 'bazait',
    icon: '🐝',
    title: 'Corzile bâzâie',
    items: [
      'Pune degetul aproape de bara metalică din dreapta tastei (spre corp), nu în mijlocul tastei.',
      'Apasă cu vârful degetului, nu cu partea plată. Ține unghiile tăiate scurt la mâna stângă.',
      'Ține degetele „arcuite” ca niște ciocănele, ca să nu atingi corzile vecine.',
      'Verifică fiecare coardă a acordului pe rând: cânt-o singură și vezi care bâzâie sau nu sună deloc.',
      'Dacă bâzâie și corzile libere (fără să apeși nimic), poate fi o problemă de reglaj al chitarei – un lutier sau un magazin de muzică o poate regla.',
    ],
  },
  {
    id: 'mana-obosita',
    icon: '✋',
    title: 'Mi se obosește mâna',
    items: [
      'Relaxează degetul mare (police): stă în spatele gâtului, cam în dreptul degetului 2, nu strânge ca o menghină.',
      'Ține umărul și cotul relaxate. Verifică din când în când dacă nu ți-ai ridicat umărul.',
      'Ia pauze scurte: după fiecare 5 minute, scutură ușor mâinile și întinde degetele.',
      'Ține încheietura cât mai dreaptă; o încheietură îndoită mult obosește repede.',
      'Încălzește-te 2 minute cu exercițiul 1-2-3-4 înainte de acorduri.',
    ],
  },
  {
    id: 'acord-nu-suna',
    icon: '🎯',
    title: 'Acordul nu sună curat',
    items: [
      'Verifică întâi dacă chitara e acordată (folosește acordorul din aplicație).',
      'Cântă acordul coardă cu coardă, de jos în sus. Unde auzi o problemă, ajustează doar degetul acela.',
      'Atenție la corzile cu „x”: ele nu trebuie lovite cu pana. La D, de exemplu, începi de la coarda 4.',
      'Un deget poate „atinge” din greșeală coarda de dedesubt. Arcuiește-l mai mult.',
    ],
  },
  {
    id: 'schimbari-lente',
    icon: '🐢',
    title: 'Schimb acordurile prea încet',
    items: [
      'Exersează doar schimbarea, fără ritm: acord A → acord B → înapoi, de multe ori (exercițiul „one-minute change”).',
      'Caută „degetul pivot”: un deget care rămâne pe loc sau alunecă pe aceeași coardă între cele două acorduri.',
      'Mută toate degetele deodată, ca un bloc, nu pe rând.',
      'Folosește metronomul la tempo foarte lent (60 bpm) și schimbă la fiecare 4 timpi. Crește tempoul cu 5 bpm doar când reușești de 5 ori la rând.',
      'Nu te opri ritmul când schimbi: e mai bine să lovești corzi libere o fracțiune de secundă decât să te oprești.',
    ],
  },
  {
    id: 'motivatie',
    icon: '🌱',
    title: 'Nu am răbdare / nu progresez',
    items: [
      'Progresul la chitară vine în trepte: câteva zile pare că nu se schimbă nimic, apoi deodată merge.',
      'Mai bine 10 minute în fiecare zi decât 2 ore o dată pe săptămână. Urmărește-ți seria de zile (🔥) din aplicație.',
      'Alege un cântec care îți place și învață-l bucată cu bucată – e cea mai bună motivație.',
      'Înregistrează-te cu telefonul o dată pe săptămână. Peste o lună vei auzi diferența.',
    ],
  },
  {
    id: 'intretinere',
    icon: '🧰',
    title: 'Grija pentru chitară',
    items: [
      'Șterge corzile cu o cârpă uscată după ce cânți – rezistă mai mult și sună mai bine.',
      'Schimbă corzile la 2–3 luni (sau când sună „mort” și se acordă greu).',
      'Ține chitara departe de calorifer și de soare direct; lemnul nu iubește căldura și uscăciunea.',
      'Un suport sau o husă o feresc de lovituri.',
    ],
  },
]
