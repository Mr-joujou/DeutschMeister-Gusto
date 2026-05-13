import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '../context/UserContext';
import { Trophy, Zap, Flame, Eye, CheckCircle, XCircle, Lightbulb } from 'lucide-react';

// ============================================================
// DONNÉES DU JEU PASSIF
// ============================================================
const VERBS = [
  { inf: "bauen",       pp: "gebaut",       fr: "construire",  er3: "baut",   ete3: "baute"  },
  { inf: "lesen",       pp: "gelesen",       fr: "lire",        er3: "liest",  ete3: "las"    },
  { inf: "schreiben",   pp: "geschrieben",   fr: "écrire",      er3: "schreibt",ete3:"schrieb"},
  { inf: "machen",      pp: "gemacht",       fr: "faire",       er3: "macht",  ete3: "machte" },
  { inf: "kochen",      pp: "gekocht",       fr: "cuisiner",    er3: "kocht",  ete3: "kochte" },
  { inf: "reparieren",  pp: "repariert",     fr: "réparer",     er3: "repariert",ete3:"reparierte"},
  { inf: "öffnen",      pp: "geöffnet",      fr: "ouvrir",      er3: "öffnet", ete3: "öffnete"},
  { inf: "schließen",   pp: "geschlossen",   fr: "fermer",      er3: "schließt",ete3:"schloss"},
  { inf: "verkaufen",   pp: "verkauft",      fr: "vendre",      er3: "verkauft",ete3:"verkaufte"},
  { inf: "kaufen",      pp: "gekauft",       fr: "acheter",     er3: "kauft",  ete3: "kaufte" },
  { inf: "singen",      pp: "gesungen",      fr: "chanter",     er3: "singt",  ete3: "sang"   },
  { inf: "waschen",     pp: "gewaschen",     fr: "laver",       er3: "wäscht", ete3: "wusch"  },
  { inf: "backen",      pp: "gebacken",      fr: "cuire",       er3: "backt",  ete3: "backte" },
  { inf: "drucken",     pp: "gedruckt",      fr: "imprimer",    er3: "druckt", ete3: "druckte"},
  { inf: "erfinden",    pp: "erfunden",      fr: "inventer",    er3: "erfindet",ete3:"erfand" },
  { inf: "liefern",     pp: "geliefert",     fr: "livrer",      er3: "liefert",ete3:"lieferte"},
  { inf: "renovieren",  pp: "renoviert",     fr: "rénover",     er3: "renoviert",ete3:"renovierte"},
  { inf: "stehlen",     pp: "gestohlen",     fr: "voler",       er3: "stiehlt",ete3:"stahl"  },
  { inf: "spielen",     pp: "gespielt",      fr: "jouer",       er3: "spielt", ete3: "spielte"},
  { inf: "unterrichten",pp:"unterrichtet",   fr: "enseigner",   er3: "unterrichtet",ete3:"unterrichtete"},
];

const SUBJECTS_ACTIVE = [
  { nom: "Der Architekt",    fr: "L'architecte",   akk: "den Architekten" },
  { nom: "Die Lehrerin",     fr: "La professeure", akk: "die Lehrerin"    },
  { nom: "Das Kind",         fr: "L'enfant",        akk: "das Kind"        },
  { nom: "Der Koch",         fr: "Le cuisinier",    akk: "den Koch"        },
  { nom: "Die Firma",        fr: "L'entreprise",    akk: "die Firma"       },
  { nom: "Der Mechaniker",   fr: "Le mécanicien",   akk: "den Mechaniker"  },
  { nom: "Die Studentin",    fr: "L'étudiante",     akk: "die Studentin"   },
  { nom: "Der Bäcker",       fr: "Le boulanger",    akk: "den Bäcker"      },
  { nom: "Die Polizei",      fr: "La police",       akk: "die Polizei"     },
  { nom: "Der Ingenieur",    fr: "L'ingénieur",     akk: "den Ingenieur"   },
];

const OBJECTS = [
  { nom: "das Haus",     art: "das", subj: "Das Haus",    fr: "la maison"   },
  { nom: "das Buch",     art: "das", subj: "Das Buch",    fr: "le livre"    },
  { nom: "den Brief",    art: "der", subj: "Der Brief",   fr: "la lettre"   },
  { nom: "das Auto",     art: "das", subj: "Das Auto",    fr: "la voiture"  },
  { nom: "die Tür",      art: "die", subj: "Die Tür",     fr: "la porte"    },
  { nom: "das Fenster",  art: "das", subj: "Das Fenster", fr: "la fenêtre"  },
  { nom: "das Essen",    art: "das", subj: "Das Essen",   fr: "le repas"    },
  { nom: "den Kuchen",   art: "der", subj: "Der Kuchen",  fr: "le gâteau"   },
  { nom: "das Lied",     art: "das", subj: "Das Lied",    fr: "la chanson"  },
  { nom: "den Bericht",  art: "der", subj: "Der Bericht", fr: "le rapport"  },
  { nom: "das Paket",    art: "das", subj: "Das Paket",   fr: "le colis"    },
  { nom: "den Computer", art: "der", subj: "Der Computer",fr: "l'ordinateur"},
];

const TENSES = [
  { key: "pres", label: "Präsens",    auxPassiv: "wird",  tip: "Aktiv: Subj + Verb + Obj  →  Passiv: Obj(subj) + wird + PP" },
  { key: "pret", label: "Präteritum", auxPassiv: "wurde", tip: "Aktiv: Subj + Verb(pret) + Obj  →  Passiv: Obj(subj) + wurde + PP" },
  { key: "perf", label: "Perfekt",    auxPassiv: "ist",   tip: "Aktiv: Subj + hat + Obj + PP  →  Passiv: Obj(subj) + ist + PP + worden" },
];

const TRAPS = [
  "haben","sein","werden","geworden","hat","hatte","war","wäre",
  "hatten","würde","worden","wurde","wird","ist","sind",
  "gemacht","gebaut","gespielt","geöffnet","geschlossen","geschrieben",
  "repariert","gekauft","gesungen","gedruckt","renoviert","gestohlen",
  "von","durch","mit","dem","der","des","ein","eine","einem",
];

function seededRand(seed) {
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
}

function seededShuffle(arr, seed) {
  const r = seededRand(seed);
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildQuestion(globalIdx) {
  const level = Math.floor(globalIdx / 10) + 1;
  const qInLevel = globalIdx % 10;
  const seed = globalIdx * 7919 + 31337;
  const r = seededRand(seed);

  const verb = VERBS[Math.floor(r() * VERBS.length)];
  const subj = SUBJECTS_ACTIVE[Math.floor(r() * SUBJECTS_ACTIVE.length)];
  const obj  = OBJECTS[Math.floor(r() * OBJECTS.length)];

  let tenseIdx;
  if (level <= 10) tenseIdx = 0;
  else if (level <= 25) tenseIdx = qInLevel < 6 ? 0 : 1;
  else if (level <= 40) tenseIdx = qInLevel < 4 ? 0 : qInLevel < 7 ? 1 : 2;
  else tenseIdx = qInLevel % 3;
  const tense = TENSES[tenseIdx];

  const direction = level <= 5 ? "toPassiv" : qInLevel % 2 === 0 ? "toPassiv" : "toAktiv";
  const diff = Math.min(Math.floor((level - 1) / 8) + 1, 6);

  let givenSentence, givenFr, targetWords, taskLabel;

  if (direction === "toPassiv") {
    if (tense.key === "pres") {
      givenSentence = `${subj.nom} ${verb.er3} ${obj.nom}.`;
      givenFr = `${subj.fr} ${verb.fr} ${obj.fr}.`;
    } else if (tense.key === "pret") {
      givenSentence = `${subj.nom} ${verb.ete3} ${obj.nom}.`;
      givenFr = `${subj.fr} a ${verb.fr} ${obj.fr}.`;
    } else {
      givenSentence = `${subj.nom} hat ${obj.nom} ${verb.pp}.`;
      givenFr = `${subj.fr} a ${verb.fr} ${obj.fr}.`;
    }
    taskLabel = "➜ Transforme cette phrase à la voix PASSIVE";

    if (tense.key === "pres") {
      targetWords = [obj.subj, "wird", verb.pp, "von", subj.nom + "."];
    } else if (tense.key === "pret") {
      targetWords = [obj.subj, "wurde", verb.pp, "von", subj.nom + "."];
    } else {
      targetWords = [obj.subj, "ist", verb.pp, "worden", "von", subj.nom + "."];
    }
  } else {
    if (tense.key === "pres") {
      givenSentence = `${obj.subj} wird ${verb.pp} von ${subj.nom}.`;
      givenFr = `${obj.fr} est ${verb.fr}(e) par ${subj.fr}.`;
    } else if (tense.key === "pret") {
      givenSentence = `${obj.subj} wurde ${verb.pp} von ${subj.nom}.`;
      givenFr = `${obj.fr} a été ${verb.fr}(e) par ${subj.fr}.`;
    } else {
      givenSentence = `${obj.subj} ist ${verb.pp} worden von ${subj.nom}.`;
      givenFr = `${obj.fr} a été ${verb.fr}(e) par ${subj.fr}.`;
    }
    taskLabel = "➜ Transforme cette phrase à la voix ACTIVE";

    if (tense.key === "pres") {
      targetWords = [subj.nom, verb.er3, obj.nom + "."];
    } else if (tense.key === "pret") {
      targetWords = [subj.nom, verb.ete3, obj.nom + "."];
    } else {
      targetWords = [subj.nom, "hat", obj.nom, verb.pp + "."];
    }
  }

  const wrongPPs = VERBS.filter(v => v.pp !== verb.pp).map(v => v.pp);
  const wrongVerbs = VERBS.filter(v => v.er3 !== verb.er3).map(v => v.er3);

  const allTraps = [
    ...TRAPS.filter(w => !targetWords.some(t => t.replace(/\.$/, "") === w)),
    ...wrongPPs.slice(0, 4),
    ...wrongVerbs.slice(0, 2),
  ];

  const shuffledTraps = seededShuffle(allTraps, seed + 2).slice(0, diff + 2);
  const correctStripped = targetWords.map(w => w.replace(/\.$/, ""));
  const poolRaw = [...correctStripped, ...shuffledTraps];
  const pool = seededShuffle(poolRaw, seed + 3);

  const explanation = `📚 ${direction === "toPassiv" ? "Voix passive" : "Voix active"} (${tense.label}) :\n${tense.tip}\n\n✅ ${targetWords.join(" ")}`;

  return {
    id: globalIdx,
    level,
    qInLevel,
    diff,
    tense,
    direction,
    givenSentence,
    givenFr,
    taskLabel,
    targetWords,
    pool,
    traps: shuffledTraps,
    explanation,
  };
}

const ALL_QUESTIONS = Array.from({ length: 500 }, (_, i) => buildQuestion(i));

const COMBOS = [
  { min: 10, label: "LÉGENDAIRE 🔥", color: "#ff6584" },
  { min: 7,  label: "INCROYABLE ⚡", color: "#ffd166" },
  { min: 5,  label: "EXCELLENT ✨",  color: "#06d6a0" },
  { min: 3,  label: "COMBO ! 👊",    color: "#6c63ff" },
];

const PassiveGame = () => {
  const { userData, updateExerciseResult } = useUser();
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState([]);
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [results, setResults] = useState([]);
  const [combo, setCombo] = useState(0);
  const [score, setScore] = useState(0);
  const [xp, setXp] = useState(0);
  const [hintShown, setHintShown] = useState(false);
  const [levelUpPending, setLevelUpPending] = useState(false);
  const [shake, setShake] = useState(false);
  const [done, setDone] = useState(false);

  const q = ALL_QUESTIONS[idx];
  const level = q.level;
  const progress = (idx / 500) * 100;

  const comboLabel = COMBOS.find(c => combo >= c.min);

  const addWord = (word, uid) => {
    if (answered) return;
    setSelected(s => [...s, { word, uid }]);
  };

  const removeFromAnswer = (uid) => {
    if (answered) return;
    setSelected(s => s.filter(x => x.uid !== uid));
  };

  const clearAnswer = () => setSelected([]);

  const selectedWords = selected.map(x => x.word);
  const usedUids = new Set(selected.map(x => x.uid));

  const checkAnswer = () => {
    if (!selected.length || answered) return;
    const targetClean = q.targetWords.map(w => w.replace(/\.$/, ""));
    const userClean = selected.map(x => x.word.replace(/\.$/, ""));
    const isCorrect = JSON.stringify(userClean) === JSON.stringify(targetClean);
    
    setAnswered(true);
    setCorrect(isCorrect);
    
    const newResults = [...results];
    newResults[idx] = isCorrect;
    setResults(newResults);
    
    if (isCorrect) {
      const bonus = combo >= 5 ? combo * 2 : combo + 1;
      const pts = 10 + bonus + (hintShown ? 0 : 5);
      setScore(s => s + pts);
      setXp(x => x + pts);
      setCombo(c => c + 1);
      updateExerciseResult(q.id, true, selectedWords.join(" "), q.targetWords.join(" "), q.explanation);
    } else {
      setCombo(0);
      setShake(true);
      updateExerciseResult(q.id, false, selectedWords.join(" "), q.targetWords.join(" "), q.explanation);
      setTimeout(() => setShake(false), 350);
    }
  };

  const nextQuestion = () => {
    const nextIdx = idx + 1;
    if (nextIdx >= 500) { setDone(true); return; }
    const nextLevel = Math.floor(nextIdx / 10) + 1;
    if (nextLevel !== level) setLevelUpPending(true);
    setIdx(nextIdx);
    setSelected([]);
    setAnswered(false);
    setCorrect(false);
    setHintShown(false);
    if (nextLevel === level) setLevelUpPending(false);
  };

  const poolWithIds = q.pool.map((w, i) => ({ word: w, uid: `${idx}-pool-${i}` }));

  if (done) {
    const total = results.filter(Boolean).length;
    return (
      <div className="max-w-4xl mx-auto pb-20">
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl p-8 text-center border border-purple-500/30">
          <div className="text-6xl mb-4">🏆</div>
          <h1 className="text-3xl font-bold text-yellow-400 mb-2">Félicitations !</h1>
          <p className="text-gray-400 mb-6">500 exercices complétés ! Tu maîtrises la voix passive en allemand.</p>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-[#151820] rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400">{score}</div>
              <div className="text-xs text-gray-500">Score</div>
            </div>
            <div className="bg-[#151820] rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{total}/500</div>
              <div className="text-xs text-gray-500">Correctes</div>
            </div>
            <div className="bg-[#151820] rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">{Math.round(total / 5)}%</div>
              <div className="text-xs text-gray-500">Réussite</div>
            </div>
          </div>
          <button onClick={() => { setIdx(0); setSelected([]); setAnswered(false); setCorrect(false); setResults([]); setCombo(0); setScore(0); setXp(0); setDone(false); }} className="px-6 py-3 bg-yellow-500 text-black rounded-xl font-bold hover:bg-yellow-400 transition">
            Recommencer depuis le début
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-20">
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Niveau {level}/50</span>
          <span>{idx}/500 questions</span>
        </div>
        <div className="h-2 bg-[#2a2e3a] rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="bg-[#151820] border border-[#2a2e3a] rounded-xl p-3 text-center">
          <div className="text-xl font-bold text-purple-400">{level}</div>
          <div className="text-xs text-gray-500">Niveau</div>
        </div>
        <div className="bg-[#151820] border border-[#2a2e3a] rounded-xl p-3 text-center">
          <div className="text-xl font-bold text-yellow-400">{combo}x</div>
          <div className="text-xs text-gray-500">Combo</div>
        </div>
        <div className="bg-[#151820] border border-[#2a2e3a] rounded-xl p-3 text-center">
          <div className="text-xl font-bold text-green-400">{score}</div>
          <div className="text-xs text-gray-500">Score</div>
        </div>
        <div className="bg-[#151820] border border-[#2a2e3a] rounded-xl p-3 text-center">
          <div className="text-xl font-bold text-blue-400">{xp}</div>
          <div className="text-xs text-gray-500">XP</div>
        </div>
      </div>

      {/* Combo Banner */}
      {comboLabel && (
        <div className="text-center text-sm font-bold mb-3" style={{ color: comboLabel.color }}>
          {comboLabel.label}
        </div>
      )}

      {/* Level Up */}
      {levelUpPending && (
        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-6 text-center border border-yellow-500/30 mb-4 animate-fade-in">
          <div className="text-4xl mb-2">🎉</div>
          <h2 className="text-xl font-bold text-yellow-400 mb-1">Niveau {level} débloqué !</h2>
          <p className="text-gray-400 text-sm mb-4">
            {level <= 15 ? "Tu abordes le Präteritum passif !" : level <= 30 ? "Le Perfekt passif commence — attention à « worden » !" : "Les trois temps du passif sont en jeu."}
          </p>
          <button onClick={() => setLevelUpPending(false)} className="px-5 py-2 bg-yellow-500 text-black rounded-xl font-bold hover:bg-yellow-400 transition">
            Continuer →
          </button>
        </div>
      )}

      {!levelUpPending && (
        <>
          {/* Question Card */}
          <div className={`bg-[#151820] border border-[#2a2e3a] rounded-2xl overflow-hidden ${shake ? 'animate-shake' : ''}`}>
            <div className="p-5 border-b border-[#2a2e3a]">
              <div className="flex gap-2 mb-3 flex-wrap">
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">{q.tense.label}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${q.direction === 'toPassiv' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>
                  {q.direction === 'toPassiv' ? '→ Passif' : '→ Actif'}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">
                  {'★'.repeat(q.diff)}{'☆'.repeat(6 - q.diff)}
                </span>
              </div>

              <div className="bg-[#1c2030] rounded-xl p-4 mb-3">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Phrase donnée</div>
                <div className="text-lg font-mono text-white mb-1">{q.givenSentence}</div>
                <div className="text-sm text-gray-400 italic">🇫🇷 {q.givenFr}</div>
              </div>

              <p className="text-sm text-pink-400 font-medium">{q.taskLabel}</p>

              {hintShown && (
                <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-sm text-gray-300">
                  💡 <strong>Rappel :</strong> {q.tense.tip}
                </div>
              )}
            </div>

            <div className="p-5">
              {/* Réponse construite */}
              <div className="mb-4">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Ta réponse</div>
                <div className="min-h-[50px] bg-[#1c2030] rounded-xl p-3 flex flex-wrap gap-2">
                  {selected.length === 0 ? (
                    <span className="text-gray-500 text-sm">Clique sur les mots ci-dessous dans le bon ordre...</span>
                  ) : (
                    selected.map(({ word, uid }) => (
                      <button key={uid} onClick={() => removeFromAnswer(uid)} className="px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-lg text-sm font-mono hover:bg-purple-500/30 transition">
                        {word} <span className="text-gray-500 ml-1">✕</span>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Banque de mots */}
              <div className="mb-4">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Banque de mots</div>
                <div className="flex flex-wrap gap-2">
                  {poolWithIds.map(({ word, uid }) => {
                    const isUsed = usedUids.has(uid);
                    let isCorrect = false;
                    let isTrap = false;
                    
                    if (answered) {
                      const correctStripped = q.targetWords.map(w => w.replace(/\.$/, ""));
                      if (correctStripped.includes(word)) isCorrect = true;
                      else if (q.traps.includes(word)) isTrap = true;
                    }
                    
                    let bgClass = 'bg-[#242840] border border-[#2a2e3a] hover:border-purple-500';
                    if (isUsed) bgClass = 'bg-[#1c2030] border border-[#2a2e3a] text-gray-600 cursor-not-allowed';
                    if (answered && isCorrect) bgClass = 'border-2 border-green-500 bg-green-500/10 text-green-400';
                    if (answered && isTrap) bgClass = 'border-2 border-red-500 bg-red-500/10 text-red-400 line-through';
                    
                    return (
                      <button
                        key={uid}
                        onClick={() => !answered && !isUsed && addWord(word, uid)}
                        className={`px-3 py-2 rounded-lg text-sm font-mono transition ${bgClass}`}
                        disabled={answered || isUsed}
                      >
                        {word}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={checkAnswer}
                  disabled={answered || selected.length === 0}
                  className="flex-1 py-3 bg-purple-500 text-white rounded-xl font-bold hover:bg-purple-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Vérifier ✓
                </button>
                {!answered && (
                  <button onClick={() => setHintShown(true)} className="px-5 py-3 bg-yellow-500/20 text-yellow-400 rounded-xl font-medium hover:bg-yellow-500/30 transition">
                    <Eye className="w-4 h-4 inline mr-1" /> Indice
                  </button>
                )}
                {answered && (
                  <button onClick={nextQuestion} className="flex-1 py-3 bg-green-500 text-black rounded-xl font-bold hover:bg-green-400 transition">
                    {idx < 499 ? 'Question suivante →' : 'Terminer 🎉'}
                  </button>
                )}
                <button onClick={clearAnswer} className="px-5 py-3 bg-[#1c2030] text-gray-400 rounded-xl font-medium hover:bg-[#242840] transition">
                  Effacer ✕
                </button>
              </div>

              {/* Feedback */}
              {answered && (
                <div className={`mt-4 p-4 rounded-xl ${correct ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                  <div className={`font-bold mb-2 ${correct ? 'text-green-400' : 'text-red-400'}`}>
                    {correct ? '✓ Correct !' : '✗ Pas tout à fait...'}
                  </div>
                  {!correct && (
                    <div className="text-sm text-gray-300 mb-2">
                      Réponse attendue : <span className="font-mono text-yellow-400">{q.targetWords.join(" ")}</span>
                    </div>
                  )}
                  <div className="text-sm text-gray-400 whitespace-pre-line">{q.explanation}</div>
                </div>
              )}
            </div>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: 10 }, (_, i) => {
              const absIdx = Math.floor(idx / 10) * 10 + i;
              const isCurrent = i === q.qInLevel;
              const isDone = i < q.qInLevel;
              let dotClass = 'w-2 h-2 rounded-full bg-gray-600';
              if (isCurrent) dotClass = 'w-6 h-2 rounded-full bg-purple-500';
              else if (isDone && results[absIdx]) dotClass = 'w-2 h-2 rounded-full bg-green-500';
              else if (isDone && !results[absIdx]) dotClass = 'w-2 h-2 rounded-full bg-red-500';
              return <div key={i} className={dotClass} />;
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default PassiveGame;