import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useUser } from '../context/UserContext';
import { participialExercises } from '../data/participialExercises';
import { CheckCircle, XCircle, Lightbulb, ChevronRight, Eye, Trophy, ArrowDown } from 'lucide-react';

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const normalize = (str) => (str ?? '').trim().toLowerCase().replace(/\s+/g, ' ').replace(/\.$/, '').trim();

const ParticipialPage = () => {
  const { userData, updateExerciseResult } = useUser();

  const [exercises, setExercises] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [sessionFinished, setSessionFinished] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0 });
  const [sessionErrors, setSessionErrors] = useState([]);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [selected, setSelected] = useState([]);  // mots choisis dans l'ordre
  const [shake, setShake] = useState(false);
  const [levelUpPending, setLevelUpPending] = useState(false);
  const [combo, setCombo] = useState(0);
  const [score, setScore] = useState(0);
  const [xp, setXp] = useState(0);
  const [results, setResults] = useState([]);

  const explanationRef = useRef(null);
  const topRef = useRef(null);

  const SESSION_SIZE = 10;

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
    setResults([]);
    setCombo(0);
    setScore(0);
    setXp(0);
  }, [currentLevel]);

  useEffect(() => { generateSession(); }, [generateSession]);

  // Réinitialiser pour chaque nouvelle question
  useEffect(() => {
    if (!exercises.length) return;
    const current = exercises[currentIndex];
    if (!current) return;

    setAnswered(false);
    setIsCorrect(null);
    setShowExplanation(false);
    setShowHint(false);
    setSelected([]);
    setShake(false);

    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [exercises, currentIndex]);

  const addWord = (word, uid) => {
    if (answered) return;
    setSelected(s => [...s, { word, uid }]);
  };

  const removeFromAnswer = (uid) => {
    if (answered) return;
    setSelected(s => s.filter(x => x.uid !== uid));
  };

  const clearAnswer = () => setSelected([]);

  const checkAnswer = () => {
    if (!selected.length || answered) return;
    const current = exercises[currentIndex];
    const userAnswer = selected.map(x => x.word).join(' ');
    const isCorrect = normalize(userAnswer) === normalize(current.correctAnswer);
    
    setAnswered(true);
    setIsCorrect(isCorrect);
    
    const newResults = [...results];
    newResults[currentIndex] = isCorrect;
    setResults(newResults);
    
    if (isCorrect) {
      const bonus = combo >= 5 ? combo * 2 : combo + 1;
      const pts = 10 + bonus + (showHint ? 0 : 5);
      setScore(s => s + pts);
      setXp(x => x + pts);
      setCombo(c => c + 1);
      updateExerciseResult('participial', current.id, true, userAnswer, current.correctAnswer, current.explanation);
    } else {
      setCombo(0);
      setShake(true);
      updateExerciseResult('participial', current.id, false, userAnswer, current.correctAnswer, current.explanation);
      setTimeout(() => setShake(false), 350);
    }
    
    setSessionStats(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));
    
    if (!isCorrect) {
      setSessionErrors(prev => [...prev, {
        question: current.question,
        userAnswer,
        correctAnswer: current.correctAnswer,
        explanation: current.explanation,
      }]);
    }
    
    setTimeout(() => {
      explanationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  };

  const nextQuestion = () => {
    if (currentIndex + 1 < exercises.length) {
      setCurrentIndex(i => i + 1);
    } else {
      setSessionFinished(true);
    }
  };

  const poolWithIds = () => {
    const current = exercises[currentIndex];
    if (!current || !current.words) return [];
    // Mélanger les mots à chaque affichage
    const shuffled = shuffle([...current.words]);
    return shuffled.map((word, i) => ({ word, uid: `${currentIndex}-pool-${i}-${Date.now()}` }));
  };

  const [currentPool, setCurrentPool] = useState([]);

  useEffect(() => {
    const current = exercises[currentIndex];
    if (current && current.words) {
      const shuffled = shuffle([...current.words]);
      setCurrentPool(shuffled.map((word, i) => ({ word, uid: `${currentIndex}-pool-${i}-${Date.now()}` })));
      setSelected([]);
    }
  }, [exercises, currentIndex]);

  const usedUids = new Set(selected.map(x => x.uid));

  if (sessionFinished) {
    const rate = sessionStats.total > 0 ? Math.round((sessionStats.correct / sessionStats.total) * 100) : 0;
    return (
      <div className="max-w-3xl mx-auto pb-20 animate-fade-in">
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl p-6 border border-purple-500/30 text-center mb-6">
          <div className="w-20 h-20 mx-auto bg-purple-500/30 rounded-full flex items-center justify-center mb-4">
            {rate >= 80 ? <Trophy className="w-10 h-10 text-yellow-400" /> : <Lightbulb className="w-10 h-10 text-yellow-400" />}
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

        <div className="flex gap-3">
          <button onClick={generateSession} className="flex-1 py-4 bg-yellow-500 text-black rounded-xl font-bold hover:bg-yellow-400 transition">
            🔁 Nouvelle session
          </button>
          <button onClick={() => setCurrentLevel(l => Math.max(1, l - 10))} className="px-4 py-4 bg-[#1c2030] text-gray-300 rounded-xl font-medium hover:bg-[#242840] transition">
            Niveau −
          </button>
          <button onClick={() => setCurrentLevel(l => Math.min(41, l + 10))} className="px-4 py-4 bg-[#1c2030] text-gray-300 rounded-xl font-medium hover:bg-[#242840] transition">
            Niveau +
          </button>
        </div>
      </div>
    );
  }

  if (!exercises.length) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-yellow-400" />
      </div>
    );
  }

  const current = exercises[currentIndex];
  if (!current) return null;

  return (
    <div className="max-w-3xl mx-auto pb-20" ref={topRef}>
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Niveau {current.level}/50</span>
          <span>{currentIndex + 1}/{exercises.length}</span>
        </div>
        <div className="h-2 bg-[#2a2e3a] rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300" style={{ width: `${(currentIndex / exercises.length) * 100}%` }} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="bg-[#151820] border border-[#2a2e3a] rounded-xl p-3 text-center">
          <div className="text-xl font-bold text-purple-400">{current.level}</div>
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

      {/* Question Card */}
      <div className={`bg-[#151820] border border-[#2a2e3a] rounded-2xl overflow-hidden ${shake ? 'animate-shake' : ''}`}>
        <div className="p-5 border-b border-[#2a2e3a]">
          <div className="flex gap-2 mb-3 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              current.subtype === 'Partizip I' ? 'bg-blue-500/20 text-blue-400' :
              current.subtype === 'Partizip II' ? 'bg-green-500/20 text-green-400' :
              'bg-purple-500/20 text-purple-400'
            }`}>
              {current.subtype || 'Partizipialsatz'}
            </span>
          </div>

          <div className="bg-[#1c2030] rounded-xl p-4 mb-3">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Phrase donnée</div>
            <div className="text-lg font-mono text-white mb-1">{current.givenSentence}</div>
            {current.givenFr && <div className="text-sm text-gray-400 italic">🇫🇷 {current.givenFr}</div>}
          </div>

          <p className="text-sm text-pink-400 font-medium">{current.taskLabel || '➜ Transforme en proposition participiale'}</p>

          {showHint && (
            <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-sm text-gray-300">
              💡 <strong>Indice :</strong> {current.hint}
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
              {currentPool.map(({ word, uid }) => {
                const isUsed = usedUids.has(uid);
                let bgClass = 'bg-[#242840] border border-[#2a2e3a] hover:border-purple-500';
                if (isUsed) bgClass = 'bg-[#1c2030] border border-[#2a2e3a] text-gray-600 cursor-not-allowed';
                
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
              <button onClick={() => { setShowHint(true); setHintsUsed(h => h + 1); }} className="px-5 py-3 bg-yellow-500/20 text-yellow-400 rounded-xl font-medium hover:bg-yellow-500/30 transition">
                <Eye className="w-4 h-4 inline mr-1" /> Indice ({hintsUsed}/3)
              </button>
            )}
            {answered && (
              <button onClick={nextQuestion} className="flex-1 py-3 bg-green-500 text-black rounded-xl font-bold hover:bg-green-400 transition">
                {currentIndex + 1 < exercises.length ? 'Question suivante →' : 'Terminer 🎉'}
              </button>
            )}
            <button onClick={clearAnswer} className="px-5 py-3 bg-[#1c2030] text-gray-400 rounded-xl font-medium hover:bg-[#242840] transition">
              Effacer ✕
            </button>
          </div>

          {/* Feedback */}
          {answered && (
            <div className={`mt-4 p-4 rounded-xl ${isCorrect ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
              <div className={`font-bold mb-2 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                {isCorrect ? '✓ Correct !' : '✗ Pas tout à fait...'}
              </div>
              {!isCorrect && (
                <div className="text-sm text-gray-300 mb-2">
                  Réponse attendue : <span className="font-mono text-yellow-400">{current.correctAnswer}</span>
                </div>
              )}
              <div className="text-sm text-gray-400 whitespace-pre-line">{current.explanation}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParticipialPage;