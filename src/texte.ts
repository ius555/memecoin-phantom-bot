/**
 * Toate textele interfeței, într-un singur loc.
 * Numele componentelor rămân în engleză (ca în datasheet) și stau în fișierele de date ale plăcilor.
 */

export const T = {
  site: {
    name: 'Laboratorul de Robotică',
    short: 'Laborator',
    loading: 'Se pregătește bancul de lucru…',
    webglError: 'Browserul nu a putut porni grafica 3D (WebGL). Încearcă alt browser sau actualizează-l pe acesta.',
  },

  nav: {
    placi: 'Plăci',
    banc: 'Banc de lucru',
    lectii: 'Lecții',
    quiz: 'Quiz',
    compara: 'Compară',
    lofi: 'Lofi',
    lofiSoon: 'Muzica ambientală vine în faza 6',
    menu: 'Meniu',
    close: 'Închide',
  },

  soon: {
    kicker: 'În lucru',
    back: 'Înapoi la plăci',
    banc: {
      title: 'Banc de lucru',
      text: 'Breadboard, componente, fire și simulatorul electric se construiesc în fazele 4 și 5.',
    },
    lectii: {
      title: 'Lecții',
      text: 'Cele unsprezece capitole, de la microcontroler până la primul robot, vin în faza 6.',
    },
    quiz: {
      title: 'Quiz',
      text: 'Întrebările cu variante, cu benzi de rezistență și cu „atinge piesa" vin în faza 6.',
    },
    compara: {
      title: 'Compară',
      text: 'Comparația a două sau trei plăci, la scară reală, vine în faza 6.',
    },
    assemble: 'Modul „Asamblează" se construiește în faza 2.',
    workbench: 'Bancul de lucru se construiește în faza 4.',
  },

  difficulty: {
    incepator: 'Începător',
    mediu: 'Mediu',
    avansat: 'Avansat',
  },

  boards: {
    openOnBench: 'Deschide pe bancul de lucru',
    specs: 'Specificații',
    hideSpecs: 'Ascunde specificațiile',
    prev: 'Placa anterioară',
    next: 'Placa următoare',
    spec: {
      mcu: 'Microcontroler',
      clock: 'Frecvență',
      flash: 'Flash',
      ram: 'RAM',
      voltage: 'Tensiune logică',
      power: 'Alimentare',
      pins: 'Pini',
      pinsValue: (d: number, a: number, p: number) => `${d} digitali · ${a} analogici · ${p} PWM`,
      wireless: 'Fără fir',
      none: 'nu are',
      usb: 'USB',
      other: 'Altele',
      size: 'Dimensiuni',
      bestFor: 'Se potrivește pentru',
    },
  },

  views: {
    label: 'Vedere',
    'trei-sferturi': '3/4',
    sus: 'Sus',
    jos: 'Jos',
    fata: 'Față',
    rotate: 'Rotire',
    labels: 'Etichete',
    pinout: 'Pinout',
    find: 'Găsește piesa',
    assemble: 'Asamblează',
  },

  tooltip: {
    hint: 'apasă pentru detalii',
    hintTouch: 'atinge din nou pentru detalii',
    presoldered: 'vine gata lipită',
  },

  detail: {
    kicker: 'Componentă',
    what: 'Ce face',
    specs: 'Specificații',
    connects: 'La ce se leagă',
    pins: 'Pini',
    kit: 'În kitul de asamblare',
    presoldered: 'Vine gata lipită',
    bottom: 'Pe spatele plăcii',
    close: 'Închide',
    showPinout: 'Vezi pinout-ul',
  },

  pinout: {
    title: 'Pinout',
    legend: 'Legendă',
    hint: 'Atinge un pin ca să-i vezi funcția.',
    pin: 'Pin',
    alt: 'și',
    fn: {
      power: 'Alimentare',
      gnd: 'GND',
      digital: 'Digital',
      pwm: 'PWM',
      analog: 'Analogic',
      i2c: 'I2C',
      spi: 'SPI',
      uart: 'UART',
      other: 'Altele',
    },
  },

  find: {
    title: 'Găsește piesa',
    intro: 'Îți spun numele unei componente, tu o atingi pe placă. Cu cât ești mai rapid, cu atât primești mai multe puncte.',
    rounds: (n: number) => `${n} runde`,
    start: 'Începe',
    prompt: 'Găsește',
    round: (i: number, n: number) => `Runda ${i} din ${n}`,
    score: 'Scor',
    time: 'Timp',
    streak: 'Serie',
    correct: 'Corect!',
    wrong: (name: string) => `Aceea este ${name}.`,
    skip: 'Sari peste',
    stop: 'Oprește',
    doneTitle: 'Gata!',
    doneScore: 'Scor final',
    doneTime: 'Timp total',
    doneHits: 'Din prima',
    best: 'Cel mai bun',
    newBest: 'Record nou',
    again: 'Încă o dată',
    close: 'Închide',
    onBottom: 'Indiciu: e pe spatele plăcii, apasă „Jos".',
  },
} as const;
