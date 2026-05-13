// ============================================================
// EXERCICES SUR LES PARTICIPIALES (Partizipialsätze)
// 50 niveaux × 5 exercices = 250 exercices
// TOUT en mode reconstruction de phrase (ordre de mots)
// 4-5 mots-pièges par question
// ============================================================

const PARTIZIP_I_VERBS = [
  { infinitive: 'sprechen',  partizipI: 'sprechend',  meaning: 'parler' },
  { infinitive: 'lachen',    partizipI: 'lachend',    meaning: 'rire' },
  { infinitive: 'weinen',    partizipI: 'weinend',    meaning: 'pleurer' },
  { infinitive: 'arbeiten',  partizipI: 'arbeitend',  meaning: 'travailler' },
  { infinitive: 'schlafen',  partizipI: 'schlafend',  meaning: 'dormir' },
  { infinitive: 'lesen',     partizipI: 'lesend',     meaning: 'lire' },
  { infinitive: 'schreiben', partizipI: 'schreibend', meaning: 'écrire' },
  { infinitive: 'singen',    partizipI: 'singend',    meaning: 'chanter' },
  { infinitive: 'tanzen',    partizipI: 'tanzend',    meaning: 'danser' },
  { infinitive: 'rennen',    partizipI: 'rennend',    meaning: 'courir' },
];

const PARTIZIP_II_VERBS = [
  { infinitive: 'bauen',      partizipII: 'gebaut',      meaning: 'construire' },
  { infinitive: 'malen',      partizipII: 'gemalt',      meaning: 'peindre' },
  { infinitive: 'schreiben',  partizipII: 'geschrieben', meaning: 'écrire' },
  { infinitive: 'lesen',      partizipII: 'gelesen',     meaning: 'lire' },
  { infinitive: 'kochen',     partizipII: 'gekocht',     meaning: 'cuisiner' },
  { infinitive: 'reparieren', partizipII: 'repariert',   meaning: 'réparer' },
  { infinitive: 'öffnen',     partizipII: 'geöffnet',    meaning: 'ouvrir' },
  { infinitive: 'verkaufen',  partizipII: 'verkauft',    meaning: 'vendre' },
  { infinitive: 'finden',     partizipII: 'gefunden',    meaning: 'trouver' },
  { infinitive: 'vergessen',  partizipII: 'vergessen',   meaning: 'oublier' },
];

const NOUNS = [
  { nom: 'Mann',  artikel: 'Der', genre: 'der', fr: 'homme' },
  { nom: 'Frau',  artikel: 'Die', genre: 'die', fr: 'femme' },
  { nom: 'Kind',  artikel: 'Das', genre: 'das', fr: 'enfant' },
  { nom: 'Hund',  artikel: 'Der', genre: 'der', fr: 'chien' },
  { nom: 'Katze', artikel: 'Die', genre: 'die', fr: 'chat' },
  { nom: 'Auto',  artikel: 'Das', genre: 'das', fr: 'voiture' },
  { nom: 'Tisch', artikel: 'Der', genre: 'der', fr: 'table' },
  { nom: 'Lampe', artikel: 'Die', genre: 'die', fr: 'lampe' },
  { nom: 'Buch',  artikel: 'Das', genre: 'das', fr: 'livre' },
  { nom: 'Haus',  artikel: 'Das', genre: 'das', fr: 'maison' },
];

const PREDICATES = [
  'ist mein Freund.',
  'sitzt allein.',
  'gehört mir.',
  'ist sehr alt.',
  'steht dort.',
  'ist sehr schön.',
  'fällt auf.',
  'ist bekannt.',
  'liegt hier.',
  'ist interessant.',
];

const ADVERBS = ['laut', 'leise', 'schnell', 'langsam', 'tief', 'hell', 'aufmerksam', 'intensiv'];

// ── Banque de pièges grammaticaux ────────────────────────────────────────────
const GRAMMAR_TRAPS = [
  'der', 'die', 'das', 'den', 'dem',
  'welcher', 'welche', 'welches',
  'wird', 'wurde', 'hat', 'hatte', 'ist', 'war',
  'worden', 'geworden', 'sein', 'haben',
  'nicht', 'sehr', 'auch', 'noch', 'immer',
];

// Sélection déterministe de 4-5 pièges uniques (mélange fait dans le composant)
const pickTraps = (correctWords, level, exIdx) => {
  const seed = level * 17 + exIdx * 11;
  const result = [];

  // 2 pièges grammaticaux
  for (let i = 0; i < GRAMMAR_TRAPS.length && result.length < 2; i++) {
    const t = GRAMMAR_TRAPS[(seed + i * 3) % GRAMMAR_TRAPS.length];
    if (!correctWords.includes(t) && !result.includes(t)) result.push(t);
  }

  // 2 pièges de terminaison sur le participe
  const ENDINGS = ['er', 'es', 'en', 'em'];
  const participeWord = correctWords.find(w =>
    ENDINGS.some(e => w.endsWith('nd' + e) || (w.length > 4 && ENDINGS.some(ee => w.endsWith(ee))))
  );
  if (participeWord) {
    const base = participeWord.slice(0, -1);
    for (let i = 0; i < ENDINGS.length && result.length < 4; i++) {
      const trap = base + ENDINGS[(seed + i) % ENDINGS.length];
      if (trap !== participeWord && !correctWords.includes(trap) && !result.includes(trap)) {
        result.push(trap);
      }
    }
  }

  // 1 piège : article incorrect
  const artTraps = ['einen', 'einer', 'einem', 'eines'].filter(a => !correctWords.includes(a) && !result.includes(a));
  if (artTraps.length && result.length < 5) result.push(artTraps[seed % artTraps.length]);

  return result.slice(0, 5);
};

export const participialExercises = [];
let id = 0;

// ============================================================
// NIVEAUX 1-15 : Partizip I — phrase active simple
// ============================================================
for (let level = 1; level <= 15; level++) {
  for (let exIdx = 0; exIdx < 5; exIdx++) {
    const noun = NOUNS[(level + exIdx * 3) % NOUNS.length];
    const verb = PARTIZIP_I_VERBS[(level * 2 + exIdx) % PARTIZIP_I_VERBS.length];
    const pred = PREDICATES[(level + exIdx) % PREDICATES.length];

    const artNom       = noun.artikel;
    const relativePron = artNom === 'Der' ? 'der' : artNom === 'Die' ? 'die' : 'das';
    // Forme conjuguée simplifiée (3e pers. sing.) pour la relative
    const inf         = verb.infinitive;
    const conjVerb    = inf.endsWith('ten') ? inf.slice(0, -2) + 't'
                      : inf.endsWith('en')  ? inf.slice(0, -2) + 't'
                      : inf + 't';

    const givenSentence  = `${artNom} ${noun.nom}, ${relativePron} ${conjVerb}, ${pred}`;
    const targetSentence = `${artNom} ${verb.partizipI}e ${noun.nom} ${pred}`;
    const correctWords   = targetSentence.replace(/\.$/, '').split(' ');
    const traps          = pickTraps(correctWords, level, exIdx);
    const allWords       = [...correctWords, ...traps];

    participialExercises.push({
      id: id++,
      type: 'participial',
      subtype: 'Partizip I',
      level,
      difficulty: 1,
      givenSentence,
      givenFr: `🇫🇷 Le/La ${noun.fr} qui ${verb.meaning}...`,
      taskLabel: '➜ Transforme en proposition PARTICIPIALE (Partizip I)',
      words: allWords,
      correctWords,
      correctAnswer: targetSentence,
      hint: `Partizip I de "${verb.infinitive}" = "${verb.partizipI}" → adjectif : "${verb.partizipI}e" (devant le nom)`,
      explanation:
        `📚 PARTIZIP I — Adjectif actif\n\n` +
        `Phrase relative  : "${givenSentence}"\n` +
        `Forme participiale : "${targetSentence}"\n\n` +
        `📌 Règle :\n` +
        `  • Partizip I = infinitif + -d → "${verb.infinitive}" → "${verb.partizipI}"\n` +
        `  • Le pronom relatif (${relativePron}) et le verbe conjugué disparaissent\n` +
        `  • Le participe se place avant le nom et prend la terminaison -e\n\n` +
        `💡 Traduction : "Le/La ${noun.fr} qui ${verb.meaning}..."`,
    });
  }
}

// ============================================================
// NIVEAUX 16-30 : Partizip II — phrase passive
// ============================================================
for (let level = 16; level <= 30; level++) {
  for (let exIdx = 0; exIdx < 5; exIdx++) {
    const noun = NOUNS[(level + exIdx * 3) % NOUNS.length];
    const verb = PARTIZIP_II_VERBS[(level * 2 + exIdx) % PARTIZIP_II_VERBS.length];
    const pred = PREDICATES[(level + exIdx) % PREDICATES.length];

    const artNom       = noun.artikel;
    const relativePron = artNom === 'Der' ? 'der' : artNom === 'Die' ? 'die' : 'das';

    const givenSentence  = `${artNom} ${noun.nom}, ${relativePron} ${verb.partizipII} wurde, ${pred}`;
    const targetSentence = `${artNom} ${verb.partizipII}e ${noun.nom} ${pred}`;
    const correctWords   = targetSentence.replace(/\.$/, '').split(' ');
    const traps          = pickTraps(correctWords, level, exIdx);
    const allWords       = [...correctWords, ...traps];

    participialExercises.push({
      id: id++,
      type: 'participial',
      subtype: 'Partizip II',
      level,
      difficulty: 2,
      givenSentence,
      givenFr: `🇫🡦 Le/La ${noun.fr} qui a été ${verb.meaning}(e)...`,
      taskLabel: '➜ Transforme en proposition PARTICIPIALE (Partizip II)',
      words: allWords,
      correctWords,
      correctAnswer: targetSentence,
      hint: `Partizip II de "${verb.infinitive}" = "${verb.partizipII}" → adjectif : "${verb.partizipII}e"`,
      explanation:
        `📚 PARTIZIP II — Adjectif passif\n\n` +
        `Phrase relative  : "${givenSentence}"\n` +
        `Forme participiale : "${targetSentence}"\n\n` +
        `📌 Règle :\n` +
        `  • Partizip II de "${verb.infinitive}" → "${verb.partizipII}"\n` +
        `  • Le pronom relatif et "wurde" disparaissent\n` +
        `  • Le participe se place avant le nom + terminaison -e\n\n` +
        `💡 Traduction : "Le/La ${noun.fr} ${verb.meaning}(e)..."`,
    });
  }
}

// ============================================================
// NIVEAUX 31-40 : Partizip I + adverbe antéposé
// ============================================================
for (let level = 31; level <= 40; level++) {
  for (let exIdx = 0; exIdx < 5; exIdx++) {
    const noun = NOUNS[(level + exIdx * 2) % NOUNS.length];
    const verb = PARTIZIP_I_VERBS[(level + exIdx) % PARTIZIP_I_VERBS.length];
    const adv  = ADVERBS[(level + exIdx) % ADVERBS.length];
    const pred = PREDICATES[(level + exIdx * 2) % PREDICATES.length];

    const artNom       = noun.artikel;
    const relativePron = artNom === 'Der' ? 'der' : artNom === 'Die' ? 'die' : 'das';
    const inf          = verb.infinitive;
    const conjVerb     = inf.endsWith('ten') ? inf.slice(0, -2) + 't'
                       : inf.endsWith('en')  ? inf.slice(0, -2) + 't'
                       : inf + 't';

    const givenSentence  = `${artNom} ${noun.nom}, ${relativePron} ${adv} ${conjVerb}, ${pred}`;
    const targetSentence = `${artNom} ${adv} ${verb.partizipI}e ${noun.nom} ${pred}`;
    const correctWords   = targetSentence.replace(/\.$/, '').split(' ');
    const traps          = pickTraps(correctWords, level, exIdx);
    const allWords       = [...correctWords, ...traps];

    participialExercises.push({
      id: id++,
      type: 'participial',
      subtype: 'Partizip I + Adv.',
      level,
      difficulty: 3,
      givenSentence,
      givenFr: `🇫🇷 Le/La ${noun.fr} qui ${verb.meaning} ${adv}...`,
      taskLabel: '➜ Transforme en participiale avec adverbe',
      words: allWords,
      correctWords,
      correctAnswer: targetSentence,
      hint: `L'adverbe "${adv}" se place AVANT le participe : "${adv} ${verb.partizipI}e"`,
      explanation:
        `📚 PARTIZIP I avec adverbe\n\n` +
        `Phrase relative  : "${givenSentence}"\n` +
        `Forme participiale : "${targetSentence}"\n\n` +
        `📌 Règle :\n` +
        `  • L'adverbe se place avant le participe : "${adv} ${verb.partizipI}e"\n` +
        `  • Ordre final : Article + Adv. + Participe + Nom + Prédicat\n\n` +
        `💡 Traduction : "Le/La ${noun.fr} qui ${verb.meaning} ${adv}..."`,
    });
  }
}

// ============================================================
// NIVEAUX 41-50 : Phrases longues avec complément de lieu
// ============================================================
const LONG_SENTENCES = [
  {
    relative:    'Der Mann, der im Garten arbeitet, ist mein Vater.',
    participial: 'Der im Garten arbeitende Mann ist mein Vater.',
    type: 'Partizip I',
    fr: "L'homme qui travaille dans le jardin est mon père.",
  },
  {
    relative:    'Die Frau, die auf dem Sofa schläft, ist müde.',
    participial: 'Die auf dem Sofa schlafende Frau ist müde.',
    type: 'Partizip I',
    fr: 'La femme qui dort sur le canapé est fatiguée.',
  },
  {
    relative:    'Das Auto, das vor dem Haus repariert wurde, ist alt.',
    participial: 'Das vor dem Haus reparierte Auto ist alt.',
    type: 'Partizip II',
    fr: 'La voiture réparée devant la maison est vieille.',
  },
  {
    relative:    'Das Buch, das auf dem Tisch liegt, ist interessant.',
    participial: 'Das auf dem Tisch liegende Buch ist interessant.',
    type: 'Partizip I',
    fr: 'Le livre posé sur la table est intéressant.',
  },
  {
    relative:    'Der Hund, der auf der Straße rennt, gehört mir.',
    participial: 'Der auf der Straße rennende Hund gehört mir.',
    type: 'Partizip I',
    fr: "Le chien qui court dans la rue m'appartient.",
  },
  {
    relative:    'Die Lampe, die am Fenster gefunden wurde, ist kaputt.',
    participial: 'Die am Fenster gefundene Lampe ist kaputt.',
    type: 'Partizip II',
    fr: 'La lampe trouvée à la fenêtre est cassée.',
  },
  {
    relative:    'Das Kind, das im Zimmer singt, ist glücklich.',
    participial: 'Das im Zimmer singende Kind ist glücklich.',
    type: 'Partizip I',
    fr: "L'enfant qui chante dans la chambre est heureux.",
  },
  {
    relative:    'Der Brief, der auf dem Tisch geschrieben wurde, ist wichtig.',
    participial: 'Der auf dem Tisch geschriebene Brief ist wichtig.',
    type: 'Partizip II',
    fr: 'La lettre écrite sur la table est importante.',
  },
  {
    relative:    'Die Katze, die vor dem Haus schläft, ist schwarz.',
    participial: 'Die vor dem Haus schlafende Katze ist schwarz.',
    type: 'Partizip I',
    fr: 'Le chat qui dort devant la maison est noir.',
  },
  {
    relative:    'Das Haus, das in der Stadt gebaut wurde, ist groß.',
    participial: 'Das in der Stadt gebaute Haus ist groß.',
    type: 'Partizip II',
    fr: 'La maison construite dans la ville est grande.',
  },
];

for (let level = 41; level <= 50; level++) {
  for (let exIdx = 0; exIdx < 5; exIdx++) {
    const s            = LONG_SENTENCES[(level * exIdx + exIdx) % LONG_SENTENCES.length];
    const correctWords = s.participial.replace(/\.$/, '').split(' ');
    const traps        = pickTraps(correctWords, level, exIdx);
    const allWords     = [...correctWords, ...traps];

    participialExercises.push({
      id: id++,
      type: 'participial',
      subtype: s.type + ' + lieu',
      level,
      difficulty: 4 + Math.floor((level - 41) / 5),
      givenSentence: s.relative,
      givenFr: `🇫🇷 ${s.fr}`,
      taskLabel: `➜ Transforme en participiale (${s.type}) avec complément de lieu`,
      words: allWords,
      correctWords,
      correctAnswer: s.participial,
      hint: 'Complément de lieu entre l\'article et le participe → Article + [lieu + participe] + Nom',
      explanation:
        `📚 PARTIZIPIALSATZ avec complément de lieu\n\n` +
        `Phrase relative  : "${s.relative}"\n` +
        `Forme participiale : "${s.participial}"\n\n` +
        `📌 Règle (${s.type}) :\n` +
        `  • Le complément de lieu se place avant le participe\n` +
        `  • Ordre : Article + [Lieu + Participe + terminaison] + Nom + Prédicat\n\n` +
        `💡 Traduction : "${s.fr}"`,
    });
  }
}

console.log(`✅ ParticipialExercises: ${participialExercises.length} exercices`);