import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { ALL_EXERCISES, EXERCISE_TYPES } from '../data/exercises/index';
import { CheckCircle, XCircle, Lightbulb, ChevronRight, Lock, Eye, Trophy, AlertCircle, ArrowDown } from 'lucide-react';

// Mélangeur Fisher-Yates
const shuffleArray = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const normalizeText = (str) => {
  if (!str) return '';
  return str
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,!?])/g, '$1')
    .replace(/\.$/, '')
    .trim();
};

const prepareExercise = (ex) => ({
  ...ex,
  shuffledOptions: ex.options ? shuffleArray([...ex.options]) : [],
});

const ExercisesPage = () => {
  const { userData, updateExerciseResult, getCurrentLevelProgress, isLevelUnlocked } = useUser();
  const [searchParams] = useSearchParams();
  const exerciseType = searchParams.get('type') || 'article';
  const urlLevel = searchParams.get('level');

  const currentTypeConfig = EXERCISE_TYPES.find(t => t.id === exerciseType) || EXERCISE_TYPES[0];

  const [currentLevel, setCurrentLevel] = useState(() => {
    if (urlLevel) {
      const level = parseInt(urlLevel);
      return !isNaN(level) && level >= 1 && level <= 50 ? level : userData.currentLevel;
    }
    return userData.currentLevel;
  });

  const [exercises, setExercises] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [usedExerciseIds, setUsedExerciseIds] = useState([]);
  const [isCorrect, setIsCorrect] = useState(null);
  const [levelResult, setLevelResult] = useState(null);
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [modalTimer, setModalTimer] = useState(0);
  const [modalCanClose, setModalCanClose] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  
  // États pour l'ordre des mots
  const [wordBank, setWordBank] = useState([]);
  const [sentenceWords, setSentenceWords] = useState([]);
  const [wordOrderAnswer, setWordOrderAnswer] = useState(''); // ← AJOUTÉ

  const explanationRef = useRef(null);
  const topRef = useRef(null);

  const isLevelAccessible = (level) => {
    if (level === 1) return true;
    const prevKey = `level${level - 1}`;
    const prevProgress = userData.levelProgress?.[prevKey];
    if (!prevProgress || prevProgress.total === 0) return false;
    return (prevProgress.correct / prevProgress.total) * 100 >= 80;
  };

  const levelUnlocked = isLevelAccessible(currentLevel);
  const progress = getCurrentLevelProgress();

  useEffect(() => {
    if (showLevelModal) {
      setModalCanClose(false);
      setModalTimer(5);
      const interval = setInterval(() => {
        setModalTimer(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setModalCanClose(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [showLevelModal]);

  const loadNewExercises = (resetIds = false) => {
    const ids = resetIds ? [] : usedExerciseIds;
    if (resetIds) setUsedExerciseIds([]);

    let pool = ALL_EXERCISES.filter(ex => ex.type === exerciseType && ex.level === currentLevel);
    pool = pool.filter(ex => !ids.includes(ex.id));

    if (pool.length < 5) {
      const backup = ALL_EXERCISES.filter(ex => ex.type === exerciseType && ex.level === currentLevel);
      pool = [...pool, ...backup];
    }

    const shuffledPool = shuffleArray(pool);
    const selectedExercises = shuffledPool.slice(0, 5).map(prepareExercise);
    
    setExercises(selectedExercises);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setAnswered(false);
    setShowExplanation(false);
    setIsCorrect(null);
    setShowHint(false);
    setHintsUsed(0);
    setLevelResult(null);
    setShowLevelModal(false);
    setWordBank([]);
    setSentenceWords([]);
    setWordOrderAnswer('');
  };

  useEffect(() => {
    if (levelUnlocked) {
      loadNewExercises(true);
    }
  }, [currentLevel, exerciseType]);

  // Réinitialiser l'ordre des mots quand l'exercice change
  useEffect(() => {
    const current = exercises[currentIndex];
    if (current && current.type === 'wordorder' && current.words) {
      const shuffled = shuffleArray([...current.words]);
      setWordBank(shuffled);
      setSentenceWords([]);
      setWordOrderAnswer('');
    }
  }, [exercises, currentIndex]);

  const checkLevelCompletion = () => {
    const lp = userData.levelProgress?.[`level${currentLevel}`];
    const rate = lp?.total > 0 ? (lp.correct / lp.total) * 100 : 0;
    setLevelResult(rate >= 80 ? 'success' : 'fail');
    setShowLevelModal(true);
  };

  const addWordToSentence = (word, idx) => {
    if (answered) return;
    const newBank = [...wordBank];
    newBank.splice(idx, 1);
    setWordBank(newBank);
    setSentenceWords([...sentenceWords, word]);
  };

  const removeWordFromSentence = (idx) => {
    if (answered) return;
    const word = sentenceWords[idx];
    const newSentence = [...sentenceWords];
    newSentence.splice(idx, 1);
    setSentenceWords(newSentence);
    setWordBank([...wordBank, word]);
  };

  const validateWordOrder = () => {
    if (answered) return;
    const current = exercises[currentIndex];
    
    let userAnswer = sentenceWords.join(' ');
    userAnswer = userAnswer.replace(/\s+([.,!?])/g, '$1').trim();
    
    const normalizedUser = normalizeText(userAnswer);
    const normalizedCorrect = normalizeText(current.correctAnswer);
    
    const correct = normalizedUser === normalizedCorrect;
    
    setWordOrderAnswer(userAnswer);
    setIsCorrect(correct);
    setAnswered(true);
    setShowExplanation(true);
    
    updateExerciseResult(current.id, correct, userAnswer, current.correctAnswer, current.explanation);
    if (!correct) setUsedExerciseIds(prev => [...prev, current.id]);
    
    setTimeout(() => {
      explanationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  };

  const validateQC = (answer) => {
    if (answered || !exercises[currentIndex]) return;
    const current = exercises[currentIndex];
    const correct = normalizeText(answer) === normalizeText(current.correctAnswer);
    
    setSelectedAnswer(answer);
    setIsCorrect(correct);
    setAnswered(true);
    setShowExplanation(true);
    
   updateExerciseResult(exerciseType, current.id, correct, answer, current.correctAnswer, current.explanation);
    
    setTimeout(() => {
      explanationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  };

  const useHint = () => {
    if (hintsUsed >= 4 || showHint) return;
    setHintsUsed(h => h + 1);
    setShowHint(true);
  };

  const nextExercise = () => {
    if (currentIndex + 1 < exercises.length) {
      setCurrentIndex(i => i + 1);
      setSelectedAnswer(null);
      setAnswered(false);
      setShowExplanation(false);
      setIsCorrect(null);
      setShowHint(false);
      setWordBank([]);
      setSentenceWords([]);
      setWordOrderAnswer('');
      topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      setTimeout(checkLevelCompletion, 100);
    }
  };

  const replayLevel = () => {
    setShowLevelModal(false);
    loadNewExercises(true);
  };

  const goToNextLevel = () => {
    setShowLevelModal(false);
    if (currentLevel < 50) {
      setCurrentLevel(l => l + 1);
    }
  };

  const LevelModal = () => {
    if (!showLevelModal) return null;
    const lp = userData.levelProgress?.[`level${currentLevel}`];
    const rate = lp?.total > 0 ? Math.round((lp.correct / lp.total) * 100) : 0;
    const correctCount = lp?.correct || 0;
    const totalCount = lp?.total || 0;

    return (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
        <div className={`bg-[#151820] border-2 rounded-2xl p-6 max-w-sm w-full text-center ${
          levelResult === 'success' ? 'border-green-500' : 'border-red-500'
        }`}>
          {levelResult === 'success' ? (
            <>
              <div className="w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                <Trophy className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Félicitations ! 🎉</h2>
              <p className="text-gray-400 mb-2">Niveau {currentLevel} : <span className="text-green-400 font-bold">{rate}%</span></p>
              <p className="text-sm text-gray-500 mb-4">{correctCount}/{totalCount} bonnes réponses</p>
              <div className="flex gap-3">
                <button onClick={replayLevel} disabled={!modalCanClose}
                  className={`flex-1 py-3 rounded-xl font-medium transition ${modalCanClose ? 'bg-[#1c2030] text-gray-300 hover:bg-[#242840]' : 'bg-gray-700/50 text-gray-500 cursor-not-allowed'}`}>
                  🔁 Rejouer {!modalCanClose && `(${modalTimer}s)`}
                </button>
                <button onClick={goToNextLevel} disabled={!modalCanClose}
                  className={`flex-1 py-3 rounded-xl font-bold transition ${modalCanClose ? 'bg-green-500 text-black hover:bg-green-400' : 'bg-gray-700/50 text-gray-500 cursor-not-allowed'}`}>
                  Suivant → {!modalCanClose && `(${modalTimer}s)`}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="w-20 h-20 mx-auto bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Pas encore ! 💪</h2>
              <p className="text-gray-400 mb-2"><span className="text-red-400 font-bold">{rate}%</span> — 80% requis</p>
              <p className="text-sm text-gray-500 mb-4">{correctCount}/{totalCount} bonnes réponses</p>
              <button onClick={replayLevel} disabled={!modalCanClose}
                className={`w-full py-3 rounded-xl font-bold transition ${modalCanClose ? 'bg-yellow-500 text-black hover:bg-yellow-400' : 'bg-gray-700/50 text-gray-500 cursor-not-allowed'}`}>
                🔁 Rejouer {!modalCanClose && `(${modalTimer}s)`}
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  // Niveau verrouillé
  if (!levelUnlocked && !urlLevel) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="w-24 h-24 bg-[#1c2030] rounded-full flex items-center justify-center mb-6">
          <Lock className="w-12 h-12 text-gray-500" />
        </div>
        <h2 className="text-xl font-bold mb-2">Niveau {currentLevel} verrouillé</h2>
        <p className="text-gray-400 mb-4">Atteignez 80% au niveau {currentLevel - 1} pour débloquer.</p>
        <div className="bg-[#151820] border border-[#2a2e3a] rounded-xl p-4 w-full max-w-xs">
          <div className="flex justify-between text-sm mb-2">
            <span>Niveau {currentLevel - 1}</span>
            <span>{Math.round(progress.successRate)}%</span>
          </div>
          <div className="h-2 bg-[#2a2e3a] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full" style={{ width: `${Math.min(progress.successRate, 100)}%` }} />
          </div>
          <p className="text-xs text-gray-500 mt-3">80% requis pour débloquer</p>
        </div>
      </div>
    );
  }

  if (exercises.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-yellow-400" />
      </div>
    );
  }

  const current = exercises[currentIndex];
  if (!current) return null;

  const getColorClass = () => {
    switch(currentTypeConfig?.color) {
      case 'blue': return 'bg-blue-500/20 text-blue-400';
      case 'purple': return 'bg-purple-500/20 text-purple-400';
      case 'green': return 'bg-green-500/20 text-green-400';
      case 'orange': return 'bg-orange-500/20 text-orange-400';
      case 'red': return 'bg-red-500/20 text-red-400';
      case 'teal': return 'bg-teal-500/20 text-teal-400';
      default: return 'bg-yellow-500/20 text-yellow-400';
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-20" ref={topRef}>
      <LevelModal />

      {/* En-tête sticky */}
      <div className="sticky top-0 bg-[#0d0f14] pt-2 pb-3 z-10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">{currentTypeConfig?.icon} {currentTypeConfig?.name}</span>
            <span className="text-xs text-gray-500">• Niveau {currentLevel}/50</span>
          </div>
          <span className="text-xs text-gray-500">{currentIndex + 1}/{exercises.length}</span>
        </div>
        <div className="h-1.5 bg-[#2a2e3a] rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full transition-all duration-300" style={{ width: `${(currentIndex / exercises.length) * 100}%` }} />
        </div>
        <div className="flex justify-between mt-1 text-[10px] text-gray-600">
          <span>Progression niveau</span>
          <span>{Math.round(progress.successRate)}% • {progress.correct}/{progress.total}</span>
        </div>
        <div className="h-1 bg-[#2a2e3a] rounded-full overflow-hidden mt-1">
          <div className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full" style={{ width: `${Math.min(progress.successRate, 100)}%` }} />
        </div>
      </div>

      {/* Carte exercice */}
      <div className="bg-[#151820] border border-[#2a2e3a] rounded-2xl overflow-hidden mt-3">
        <div className="p-5 border-b border-[#2a2e3a]">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded-full ${getColorClass()}`}>
              {currentTypeConfig?.icon} {currentTypeConfig?.name}
            </span>
          </div>
          <h2 className="text-xl font-bold font-serif mb-2">{current.question}</h2>

          <div className="flex items-center justify-between gap-2 mt-3">
            <p className="text-sm text-gray-500 italic">
              {showHint ? `💡 ${current.hint}` : '🔒 Cliquez sur "Indice" pour un coup de pouce'}
            </p>
            <button onClick={useHint} disabled={hintsUsed >= 4 || showHint}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition flex-shrink-0 ${
                hintsUsed >= 4 || showHint
                  ? 'bg-gray-600/30 text-gray-500 cursor-not-allowed'
                  : 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
              }`}>
              <Eye className="w-3 h-3" />
              Indice ({hintsUsed}/4)
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          
          {/* ORDRE DES MOTS */}
          {current.type === 'wordorder' ? (
            <>
              <div className="min-h-[80px] bg-[#1c2030] rounded-xl p-4 flex flex-wrap gap-2 items-center">
                {sentenceWords.length === 0 ? (
                  <span className="text-gray-500 text-sm">Cliquez sur les mots ci-dessous pour construire la phrase...</span>
                ) : (
                  sentenceWords.map((word, idx) => {
                    if (word === '.') {
                      return <span key={idx} className="text-lg font-bold text-white mx-1">.</span>;
                    }
                    return (
                      <button
                        key={idx}
                        onClick={() => removeWordFromSentence(idx)}
                        className="px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg text-sm font-mono hover:bg-blue-500/30 transition"
                      >
                        {word}
                      </button>
                    );
                  })
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {wordBank.map((word, idx) => (
                  <button
                    key={idx}
                    onClick={() => addWordToSentence(word, idx)}
                    className="px-3 py-2 bg-[#242840] border border-[#2a2e3a] rounded-lg text-sm font-mono hover:bg-[#2a2e3a] hover:border-yellow-500 transition"
                  >
                    {word}
                  </button>
                ))}
              </div>

              {!answered && (
                <button
                  onClick={validateWordOrder}
                  disabled={sentenceWords.length === 0}
                  className="w-full py-4 bg-yellow-500 text-black rounded-xl font-bold hover:bg-yellow-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Valider la phrase
                </button>
              )}

              {answered && (
                <div className={`rounded-xl p-3 text-sm font-medium text-center ${
                  isCorrect
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  {isCorrect ? '✅ Bonne réponse !' : `❌ La bonne réponse était : "${current.correctAnswer}"`}
                </div>
              )}
            </>
          ) : (
            /* QCM */
            <>
              <div className="grid grid-cols-1 gap-2">
                {(current.shuffledOptions || current.options || []).map((opt, idx) => {
                  const isThisCorrect = normalizeText(opt) === normalizeText(current.correctAnswer);
                  const isSelected = selectedAnswer === opt;

                  let cls = 'p-4 rounded-xl text-left font-medium transition-all active:scale-[0.98] ';
                  if (!answered) cls += 'bg-[#1c2030] hover:bg-[#242840] cursor-pointer';
                  else if (isThisCorrect) cls += 'border-2 border-green-500 bg-green-500/10';
                  else if (isSelected && !isThisCorrect) cls += 'border-2 border-red-500 bg-red-500/10';
                  else cls += 'bg-[#1c2030] opacity-40';

                  return (
                    <button key={idx} onClick={() => validateQC(opt)} disabled={answered} className={cls}>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-base">{opt}</span>
                        {answered && isThisCorrect && <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />}
                        {answered && isSelected && !isThisCorrect && <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {answered && (
                <div className={`rounded-xl p-3 text-sm font-medium text-center ${
                  isCorrect
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  {isCorrect ? '✅ Bonne réponse !' : `❌ La bonne réponse était : "${current.correctAnswer}"`}
                </div>
              )}
            </>
          )}

          {/* Bouton suivant sticky */}
          {answered && (
            <div className="sticky top-24 z-10 py-2 bg-[#0d0f14] -mx-5 px-5">
              <button onClick={nextExercise}
                className="w-full py-4 bg-yellow-500 text-black rounded-xl font-bold hover:bg-yellow-400 transition flex items-center justify-center gap-2 active:scale-[0.98]">
                {currentIndex + 1 < exercises.length ? 'Exercice suivant →' : 'Terminer le niveau →'}
                <ChevronRight className="w-4 h-4" />
              </button>
              {showExplanation && (
                <button onClick={() => explanationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  className="w-full mt-2 py-2 bg-[#1c2030] text-gray-400 rounded-xl text-sm flex items-center justify-center gap-1 hover:text-gray-300 transition">
                  <ArrowDown className="w-3 h-3" />
                  Voir l'explication
                </button>
              )}
            </div>
          )}

          {/* Explication */}
          {showExplanation && (
            <div ref={explanationRef} className="p-4 bg-[#1c2030] rounded-xl border border-[#2a2e3a]">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-300 whitespace-pre-line leading-relaxed font-mono">
                  {current.explanation}
                </div>
              </div>
              {current.exampleSentence && (
                <div className="mt-3 p-3 bg-[#242840] rounded-lg border border-blue-500/20">
                  <p className="text-xs text-blue-400 mb-1">📝 Exemple :</p>
                  <p className="text-sm font-medium text-white">{current.exampleSentence}</p>
                </div>
              )}
            </div>
          )}

          {/* Bouton suivant en bas */}
          {answered && (
            <button onClick={nextExercise}
              className="w-full py-4 bg-yellow-500 text-black rounded-xl font-bold hover:bg-yellow-400 transition flex items-center justify-center gap-2 active:scale-[0.98]">
              {currentIndex + 1 < exercises.length ? 'Exercice suivant →' : 'Terminer le niveau →'}
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExercisesPage;