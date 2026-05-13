import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useUser } from '../context/UserContext';
import { participialExercises } from '../data/participialExercises';
import {
  CheckCircle, XCircle, Lightbulb, ChevronRight,
  Eye, Trophy, ArrowDown,
} from 'lucide-react';

// ─── UTILITAIRES ─────────────────────────────────────────────────────────────

/**
 * Mélange un tableau avec Fisher-Yates.
 * Renvoie TOUJOURS un nouveau tableau (jamais en mutation).
 */
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const normalize = (str) =>
  (str ?? '').trim().toLowerCase().replace(/\s+/g, ' ').replace(/\.$/, '').trim();

// ─── COMPOSANT PRINCIPAL ─────────────────────────────────────────────────────

const ParticipialPage = () => {
  const { userData, updateExerciseResult } = useUser();

  // ── session ──
  const [exercises, setExercises]       = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [sessionFinished, setSessionFinished] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0 });
  const [sessionErrors, setSessionErrors] = useState([]);

  // ── question courante ──
  const [answered, setAnswered]         = useState(false);
  const [isCorrect, setIsCorrect]       = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showHint, setShowHint]         = useState(false);
  const [hintsUsed, setHintsUsed]       = useState(0);

  // ── QCM : options mélangées pour CETTE question ──
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [selectedAnswer, setSelectedAnswer]   = useState(null);

  // ── Ordre des mots : bank + sentence ──
  // Chaque mot est un objet {word, uid} pour gérer les doublons proprement
  const [wordBank, setWordBank]         = useState([]);
  const [sentenceSlots, setSentenceSlots] = useState([]);

  const explanationRef = useRef(null);
  const topRef         = useRef(null);

  const SESSION_SIZE = 10;

  // ── Générer une session ───────────────────────────────────────────────────
  const generateSession = useCallback(() => {
    let pool = participialExercises.filter(
      ex => ex.level >= currentLevel && ex.level <= currentLevel + 9
    );
    if (pool.length < SESSION_SIZE) {
      pool = participialExercises.slice(0, SESSION_SIZE * 2);
    }
    const picked = shuffle(pool).slice(0, SESSION_SIZE);

    setExercises(picked);
    setCurrentIndex(0);
    setSessionFinished(false);
    setSessionStats({ correct: 0, total: 0 });
    setSessionErrors([]);
  }, [currentLevel]);

  useEffect(() => { generateSession(); }, [generateSession]);

  // ── Réinitialiser l'état de réponse à chaque changement de question ───────
  // C'est ici que le mélange se produit — à chaque nouvelle question.
  useEffect(() => {
    if (!exercises.length) return;
    const current = exercises[currentIndex];
    if (!current) return;

    setAnswered(false);
    setIsCorrect(null);
    setShowExplanation(false);
    setShowHint(false);
    setSelectedAnswer(null);

    if (current.words) {
      // Mode ordre de mots : mélanger words + pièges, attribuer des uid uniques
      const mixed = shuffle(current.words).map((w, i) => ({
        word: w,
        uid: `bank-${currentIndex}-${i}-${Math.random().toString(36).slice(2)}`,
      }));
      setWordBank(mixed);
      setSentenceSlots([]);
    } else if (current.options) {
      // ─── CORRECTION CLÉ ───────────────────────────────────────────────────
      // On mélange les options ici, dans le composant, à chaque nouvelle
      // question — jamais dans le fichier de données.
      // Ainsi la bonne réponse n'est jamais systématiquement en position 0.
      setShuffledOptions(shuffle(current.options));
      // ──────────────────────────────────────────────────────────────────────
    }

    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [exercises, currentIndex]);

  // ── Gestion mots ─────────────────────────────────────────────────────────
  const addWord = (uid) => {
    if (answered) return;
    const item = wordBank.find(x => x.uid === uid);
    if (!item) return;
    setWordBank(prev => prev.filter(x => x.uid !== uid));
    setSentenceSlots(prev => [...prev, item]);
  };

  const removeWord = (uid) => {
    if (answered) return;
    const item = sentenceSlots.find(x => x.uid === uid);
    if (!item) return;
    setSentenceSlots(prev => prev.filter(x => x.uid !== uid));
    setWordBank(prev => [...prev, item]);
  };

  const clearAll = () => {
    if (answered) return;
    setWordBank(prev => [...prev, ...sentenceSlots]);
    setSentenceSlots([]);
  };

  // ── Validation ───────────────────────────────────────────────────────────
  const recordResult = (current, ok, userAnswer) => {
    setIsCorrect(ok);
    setAnswered(true);
    setShowExplanation(true);
    setSessionStats(prev => ({ correct: prev.correct + (ok ? 1 : 0), total: prev.total + 1 }));
    if (!ok) {
      setSessionErrors(prev => [...prev, {
        question: current.question,
        userAnswer,
        correctAnswer: current.correctAnswer,
        explanation: current.explanation,
      }]);
    }
    updateExerciseResult?.(current.id, ok, userAnswer, current.correctAnswer, current.explanation);
    setTimeout(() => {
      explanationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
  };

  const validateQCM = (option) => {
    if (answered) return;
    const current = exercises[currentIndex];
    const ok = normalize(option) === normalize(current.correctAnswer);
    setSelectedAnswer(option);
    recordResult(current, ok, option);
  };

  const validateWordOrder = () => {
    if (answered || !sentenceSlots.length) return;
    const current = exercises[currentIndex];
    const userAnswer = sentenceSlots.map(x => x.word).join(' ');
    const ok = normalize(userAnswer) === normalize(current.correctAnswer);
    recordResult(current, ok, userAnswer);
  };

  // ── Navigation ────────────────────────────────────────────────────────────
  const nextExercise = () => {
    if (currentIndex + 1 < exercises.length) {
      setCurrentIndex(i => i + 1);
    } else {
      setSessionFinished(true);
    }
  };

  // ── Écran de fin ─────────────────────────────────────────────────────────
  if (sessionFinished) {
    const rate = sessionStats.total > 0
      ? Math.round((sessionStats.correct / sessionStats.total) * 100)
      : 0;

    return (
      <div className="max-w-3xl mx-auto pb-20 animate-fade-in">
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl p-6 border border-purple-500/30 text-center mb-6">
          <div className="w-20 h-20 mx-auto bg-purple-500/30 rounded-full flex items-center justify-center mb-4">
            {rate >= 80
              ? <Trophy className="w-10 h-10 text-yellow-400" />
              : <Lightbulb className="w-10 h-10 text-yellow-400" />}
          </div>
          <h2 className="text-2xl font-bold mb-2">
            {rate >= 80 ? 'Excellent ! 🎉' : rate >= 50 ? 'Bien joué ! 👍' : 'Continue comme ça ! 💪'}
          </h2>
          <p className="text-gray-400">Session Partizipialsätze terminée</p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-[#151820] border border-[#2a2e3a] rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-green-400">{sessionStats.correct}</div>
            <div className="text-xs text-gray-500">Correctes</div>
          </div>
          <div className="bg-[#151820] border border-[#2a2e3a] rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-red-400">{sessionStats.total - sessionStats.correct}</div>
            <div className="text-xs text-gray-500">Erreurs</div>
          </div>
          <div className="bg-[#151820] border border-[#2a2e3a] rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-yellow-400">{rate}%</div>
            <div className="text-xs text-gray-500">Précision</div>
          </div>
        </div>

        {sessionErrors.length > 0 && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
            <p className="text-sm font-medium text-red-400 mb-3">📝 Erreurs à réviser :</p>
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {sessionErrors.map((err, i) => (
                <div key={i} className="p-3 bg-[#1c2030] rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">{err.question}</p>
                  <div className="flex gap-4 flex-wrap">
                    <span className="text-xs text-red-400">❌ {err.userAnswer}</span>
                    <span className="text-xs text-green-400">✅ {err.correctAnswer}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={generateSession}
            className="flex-1 py-4 bg-yellow-500 text-black rounded-xl font-bold hover:bg-yellow-400 transition"
          >
            🔁 Nouvelle session
          </button>
          <button
            onClick={() => setCurrentLevel(l => Math.max(1, l - 10))}
            className="px-4 py-4 bg-[#1c2030] text-gray-300 rounded-xl font-medium hover:bg-[#242840] transition"
          >
            Niveau −
          </button>
          <button
            onClick={() => setCurrentLevel(l => Math.min(41, l + 10))}
            className="px-4 py-4 bg-[#1c2030] text-gray-300 rounded-xl font-medium hover:bg-[#242840] transition"
          >
            Niveau +
          </button>
        </div>
      </div>
    );
  }

  // ── Chargement ────────────────────────────────────────────────────────────
  if (!exercises.length) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-yellow-400" />
      </div>
    );
  }

  const current = exercises[currentIndex];
  if (!current) return null;

  const isWordMode = Boolean(current.words);

  // ── Rendu principal ───────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto pb-20" ref={topRef}>

      {/* ── Barre de progression sticky ── */}
      <div className="sticky top-0 bg-[#0d0f14] pt-2 pb-3 z-10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">📝 Partizipialsätze</span>
            <span className="text-xs text-gray-500">• Niv. {current.level}</span>
          </div>
          <span className="text-xs text-gray-500">{currentIndex + 1} / {exercises.length}</span>
        </div>
        <div className="h-1.5 bg-[#2a2e3a] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all duration-300"
            style={{ width: `${(currentIndex / exercises.length) * 100}%` }}
          />
        </div>
      </div>

      {/* ── Carte exercice ── */}
      <div className="bg-[#151820] border border-[#2a2e3a] rounded-2xl overflow-hidden mt-3">

        {/* En-tête question */}
        <div className="p-5 border-b border-[#2a2e3a]">
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              current.subtype === 'Partizip I'
                ? 'bg-blue-500/20 text-blue-400'
                : current.subtype === 'Partizip II'
                ? 'bg-green-500/20 text-green-400'
                : 'bg-purple-500/20 text-purple-400'
            }`}>
              {current.subtype || 'Partizipialsatz'}
            </span>
            <span className="text-xs text-gray-600">
              {'★'.repeat(current.difficulty)}{'☆'.repeat(5 - current.difficulty)}
            </span>
          </div>

          <h2 className="text-xl font-bold font-serif mb-3 whitespace-pre-line leading-relaxed">
            {current.question}
          </h2>

          <div className="flex items-center justify-between gap-2 mt-3">
            <p className="text-sm text-gray-500 italic">
              {showHint
                ? `💡 ${current.hint}`
                : '🔒 Cliquez sur "Indice" pour un coup de pouce'}
            </p>
            <button
              onClick={() => { if (!showHint) { setShowHint(true); setHintsUsed(h => h + 1); } }}
              disabled={showHint || hintsUsed >= 3}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                showHint || hintsUsed >= 3
                  ? 'bg-gray-600/30 text-gray-500 cursor-not-allowed'
                  : 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
              }`}
            >
              <Eye className="w-3 h-3" />
              Indice ({hintsUsed}/3)
            </button>
          </div>
        </div>

        {/* Corps interactif */}
        <div className="p-5 space-y-4">

          {/* ── MODE ORDRE DE MOTS ── */}
          {isWordMode ? (
            <>
              {/* Zone de construction */}
              <div className="min-h-[80px] bg-[#1c2030] rounded-xl p-4 flex flex-wrap gap-2 items-center border border-[#2a2e3a]">
                {sentenceSlots.length === 0
                  ? <span className="text-gray-500 text-sm">Cliquez sur les mots ci-dessous pour construire la phrase...</span>
                  : sentenceSlots.map(({ word, uid }) => (
                    <button
                      key={uid}
                      onClick={() => removeWord(uid)}
                      className="px-3 py-2 bg-purple-500/20 text-purple-400 rounded-lg text-sm font-mono hover:bg-purple-500/30 transition"
                    >
                      {word}
                    </button>
                  ))
                }
              </div>

              {/* Banque de mots */}
              <div className="flex flex-wrap gap-2">
                {wordBank.map(({ word, uid }) => (
                  <button
                    key={uid}
                    onClick={() => addWord(uid)}
                    className="px-3 py-2 bg-[#242840] border border-[#2a2e3a] rounded-lg text-sm font-mono hover:bg-[#2a2e3a] hover:border-yellow-500 transition"
                  >
                    {word}
                  </button>
                ))}
              </div>

              {/* Boutons action */}
              {!answered && (
                <div className="flex gap-3">
                  <button
                    onClick={validateWordOrder}
                    disabled={sentenceSlots.length === 0}
                    className="flex-1 py-4 bg-yellow-500 text-black rounded-xl font-bold hover:bg-yellow-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Valider la phrase
                  </button>
                  <button
                    onClick={clearAll}
                    className="px-4 py-4 bg-[#1c2030] text-gray-400 rounded-xl text-sm hover:text-gray-200 transition"
                  >
                    Effacer
                  </button>
                </div>
              )}
            </>
          ) : (
            /* ── MODE QCM ── */
            <div className="grid grid-cols-1 gap-2">
              {shuffledOptions.map((opt, i) => {
                const isThisCorrect = normalize(opt) === normalize(current.correctAnswer);
                const isSelected    = selectedAnswer === opt;

                let cls = 'p-4 rounded-xl text-left font-medium transition-all ';
                if (!answered) {
                  cls += 'bg-[#1c2030] hover:bg-[#242840] cursor-pointer border border-transparent hover:border-yellow-500/40';
                } else if (isThisCorrect) {
                  cls += 'border-2 border-green-500 bg-green-500/10 cursor-default';
                } else if (isSelected) {
                  cls += 'border-2 border-red-500 bg-red-500/10 cursor-default';
                } else {
                  cls += 'bg-[#1c2030] opacity-40 cursor-default border border-transparent';
                }

                return (
                  <button key={i} onClick={() => validateQCM(opt)} disabled={answered} className={cls}>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-base">{opt}</span>
                      {answered && isThisCorrect && <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />}
                      {answered && isSelected && !isThisCorrect && <XCircle className="w-5 h-5 text-red-500 shrink-0" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Résultat immédiat */}
          {answered && (
            <div className={`rounded-xl p-3 text-sm font-medium text-center ${
              isCorrect
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {isCorrect
                ? '✅ Bonne réponse !'
                : `❌ La bonne réponse était : "${current.correctAnswer}"`}
            </div>
          )}

          {/* Bouton suivant + lien explication (sticky) */}
          {answered && (
            <div className="sticky top-24 z-10 py-2 bg-[#0d0f14] -mx-5 px-5 space-y-2">
              <button
                onClick={nextExercise}
                className="w-full py-4 bg-yellow-500 text-black rounded-xl font-bold hover:bg-yellow-400 transition flex items-center justify-center gap-2"
              >
                {currentIndex + 1 < exercises.length ? 'Exercice suivant →' : 'Voir les résultats →'}
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => explanationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className="w-full py-2 bg-[#1c2030] text-gray-400 rounded-xl text-sm flex items-center justify-center gap-1 hover:text-gray-300 transition"
              >
                <ArrowDown className="w-3 h-3" /> Voir l'explication
              </button>
            </div>
          )}

          {/* Explication */}
          {showExplanation && (
            <div ref={explanationRef} className="p-4 bg-[#1c2030] rounded-xl border border-[#2a2e3a]">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                <div className="text-sm text-gray-300 whitespace-pre-line leading-relaxed">
                  {current.explanation}
                </div>
              </div>
            </div>
          )}

          {/* Bouton suivant bas de page */}
          {answered && (
            <button
              onClick={nextExercise}
              className="w-full py-4 bg-yellow-500 text-black rounded-xl font-bold hover:bg-yellow-400 transition flex items-center justify-center gap-2"
            >
              {currentIndex + 1 < exercises.length ? 'Exercice suivant →' : 'Voir les résultats →'}
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParticipialPage;