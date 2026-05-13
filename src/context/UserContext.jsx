import React, { createContext, useState, useContext, useEffect } from 'react';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

// Types d'exercices
const EXERCISE_TYPES = [
  'article', 'adjective', 'conjugation', 'modal', 'passive', 'wordorder', 'participial'
];

// Nombre d'exercices par niveau
const EXERCISES_PER_LEVEL = 5;
const REQUIRED_SUCCESS_RATE = 0.8; // 80%

export const UserProvider = ({ children }) => {
  // Structure de données unifiée
  const [userData, setUserData] = useState({
    userName: '',
    xp: 0,
    streak: 0,
    totalCorrect: 0,
    totalAnswers: 0,
    currentLevel: 1,
    levels: {},
    leaderboard: [],
    theme: 'dark',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [showNameModal, setShowNameModal] = useState(false);
  const [notification, setNotification] = useState(null);
  const isOnline = true;

  // Initialisation
  useEffect(() => {
    const saved = localStorage.getItem('deutschmeister_user_v6');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUserData(parsed);
        if (!parsed.userName) {
          setShowNameModal(true);
        }
        applyTheme(parsed.theme || 'dark');
      } catch (e) {
        console.error("Parse error:", e);
        initNewUser();
      }
    } else {
      initNewUser();
    }
    setIsLoading(false);
  }, []);

  const applyTheme = (theme) => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
    }
  };

  const initNewUser = () => {
    const initialLevels = {};
    EXERCISE_TYPES.forEach(type => {
      initialLevels[type] = {
        currentLevel: 1,
        levelProgress: {},
      };
      for (let level = 1; level <= 50; level++) {
        initialLevels[type].levelProgress[`level${level}`] = { correct: 0, total: 0, errors: [] };
      }
    });
    
    setUserData({
      userName: '',
      xp: 0,
      streak: 0,
      totalCorrect: 0,
      totalAnswers: 0,
      currentLevel: 1,
      levels: initialLevels,
      leaderboard: [],
      theme: 'dark',
    });
    applyTheme('dark');
    setShowNameModal(true);
  };

  // Sauvegarde
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('deutschmeister_user_v6', JSON.stringify(userData));
    }
  }, [userData, isLoading]);

  // Sauvegarde d'urgence (en cas d'erreur)
  const emergencySave = () => {
    localStorage.setItem('deutschmeister_user_v6_emergency', JSON.stringify(userData));
    console.log('💾 Sauvegarde d\'urgence effectuée');
  };

  // Vérifier si un niveau est débloqué (80% au précédent)
  const isLevelUnlocked = (exerciseType, level) => {
    if (level === 1) return true;
    const prevKey = `level${level - 1}`;
    const progress = userData.levels[exerciseType]?.levelProgress?.[prevKey];
    if (!progress || progress.total === 0) return false;
    return (progress.correct / progress.total) * 100 >= 80;
  };

  // Progression du niveau actuel pour un type
  const getCurrentLevelProgress = (exerciseType) => {
    const currentLevel = userData.levels[exerciseType]?.currentLevel || 1;
    const levelKey = `level${currentLevel}`;
    const progress = userData.levels[exerciseType]?.levelProgress?.[levelKey] || { correct: 0, total: 0, errors: [] };
    const successRate = progress.total > 0 ? (progress.correct / progress.total) * 100 : 0;
    return { ...progress, successRate, currentLevel };
  };

  // Progression globale (pour le Navbar)
  const getGlobalProgress = () => {
    let totalCorrect = 0;
    let totalAnswers = 0;
    EXERCISE_TYPES.forEach(type => {
      const levels = userData.levels[type]?.levelProgress || {};
      Object.values(levels).forEach(level => {
        totalCorrect += level.correct || 0;
        totalAnswers += level.total || 0;
      });
    });
    const globalLevel = Math.min(Math.floor(totalAnswers / EXERCISES_PER_LEVEL) + 1, 50);
    return { globalLevel, totalCorrect, totalAnswers };
  };

  // Obtenir les erreurs par niveau pour un type
  const getErrorsByLevel = (exerciseType) => {
    const errorsByLevel = {};
    const levels = userData.levels[exerciseType]?.levelProgress || {};
    for (let i = 1; i <= 50; i++) {
      const levelKey = `level${i}`;
      const errors = levels[levelKey]?.errors || [];
      if (errors.length > 0) {
        errorsByLevel[i] = errors;
      }
    }
    return errorsByLevel;
  };

  // Réinitialiser les erreurs d'un niveau
  const resetErrorsForLevel = (exerciseType, level) => {
    const levelKey = `level${level}`;
    setUserData(prev => ({
      ...prev,
      levels: {
        ...prev.levels,
        [exerciseType]: {
          ...prev.levels[exerciseType],
          levelProgress: {
            ...prev.levels[exerciseType]?.levelProgress,
            [levelKey]: {
              ...prev.levels[exerciseType]?.levelProgress[levelKey],
              errors: []
            }
          }
        }
      }
    }));
    showNotification(`Erreurs du niveau ${level} réinitialisées`, 'info');
  };

  // Sauter à un niveau spécifique
  const jumpToLevel = (exerciseType, level) => {
    if (isLevelUnlocked(exerciseType, level)) {
      setUserData(prev => ({
        ...prev,
        levels: {
          ...prev.levels,
          [exerciseType]: {
            ...prev.levels[exerciseType],
            currentLevel: level
          }
        }
      }));
      showNotification(`Niveau ${level} chargé`, 'success');
      return true;
    }
    showNotification(`Niveau ${level} non débloqué`, 'error');
    return false;
  };

  // Mettre à jour après un exercice
  const updateExerciseResult = (exerciseType, exerciseId, isCorrect, userAnswer, correctAnswer, explanation) => {
    const currentLevel = userData.levels[exerciseType]?.currentLevel || 1;
    const levelKey = `level${currentLevel}`;
    const currentProgress = userData.levels[exerciseType]?.levelProgress?.[levelKey] || { correct: 0, total: 0, errors: [] };

    const newCorrect = currentProgress.correct + (isCorrect ? 1 : 0);
    const newTotal = currentProgress.total + 1;

    let newErrors = [...(currentProgress.errors || [])];
    if (!isCorrect) {
      newErrors.push({
        exerciseId,
        userAnswer,
        correctAnswer,
        explanation,
        timestamp: Date.now(),
      });
    }

    const newProgress = {
      ...currentProgress,
      correct: newCorrect,
      total: newTotal,
      errors: newErrors,
    };

    let newLevel = currentLevel;
    let newXp = userData.xp + (isCorrect ? (currentLevel <= 15 ? 10 : currentLevel <= 35 ? 15 : 20) : 0);
    let newStreak = isCorrect ? userData.streak + 1 : 0;

    // ✅ CORRECTION : 5 exercices par niveau (80% = 4/5)
    if (newTotal >= EXERCISES_PER_LEVEL && (newCorrect / newTotal) >= REQUIRED_SUCCESS_RATE && currentLevel < 50) {
      newLevel = currentLevel + 1;
      newXp += 50;
      showNotification(`🎉 Niveau ${newLevel} débloqué pour ${exerciseType} !`, 'success');
    }

    // Calcul du niveau global pour le Navbar
    const globalStats = getGlobalProgress();
    const newGlobalLevel = Math.min(Math.floor((globalStats.totalAnswers + 1) / EXERCISES_PER_LEVEL) + 1, 50);

    setUserData(prev => ({
      ...prev,
      xp: newXp,
      streak: newStreak,
      currentLevel: newGlobalLevel,
      totalCorrect: prev.totalCorrect + (isCorrect ? 1 : 0),
      totalAnswers: prev.totalAnswers + 1,
      levels: {
        ...prev.levels,
        [exerciseType]: {
          ...prev.levels[exerciseType],
          currentLevel: newLevel,
          levelProgress: {
            ...prev.levels[exerciseType]?.levelProgress,
            [levelKey]: newProgress
          }
        }
      }
    }));
  };

  const addGamePoints = (points) => {
    setUserData(prev => ({
      ...prev,
      xp: prev.xp + points,
    }));
    showNotification(`+${points} XP !`, 'success');
  };

  const setUserName = (name) => {
    if (name.trim()) {
      setUserData(prev => ({ ...prev, userName: name.trim() }));
      setShowNameModal(false);
      showNotification(`Bienvenue ${name} !`, 'success');
    }
  };

  // Changer le thème
  const toggleTheme = () => {
    const newTheme = userData.theme === 'dark' ? 'light' : 'dark';
    setUserData(prev => ({ ...prev, theme: newTheme }));
    applyTheme(newTheme);
    showNotification(`Mode ${newTheme === 'light' ? 'clair' : 'sombre'} activé`, 'success');
  };

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const updateLeaderboard = (score) => {
    const newEntry = {
      name: userData.userName || 'Anonyme',
      xp: userData.xp + score,
      level: userData.levels.article?.currentLevel || 1,
      date: new Date().toISOString(),
    };
    
    setUserData(prev => {
      const existing = prev.leaderboard.findIndex(e => e.name === newEntry.name);
      let newLeaderboard;
      if (existing !== -1) {
        newLeaderboard = [...prev.leaderboard];
        newLeaderboard[existing] = newEntry;
      } else {
        newLeaderboard = [...prev.leaderboard, newEntry];
      }
      newLeaderboard.sort((a, b) => b.xp - a.xp);
      return { ...prev, leaderboard: newLeaderboard.slice(0, 20) };
    });
  };

  const getLeaderboard = () => {
    return [...userData.leaderboard].sort((a, b) => b.xp - a.xp);
  };

  // Modal de demande de nom
  const NameModal = () => {
    if (!showNameModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 modal-overlay">
        <div className="bg-[#151820] dark:bg-[#151820] light:bg-white border border-[#2a2e3a] dark:border-[#2a2e3a] light:border-gray-200 rounded-2xl p-6 max-w-sm w-full text-center">
          <div className="w-16 h-16 mx-auto bg-yellow-500/20 rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl">🇩🇪</span>
          </div>
          <h2 className="text-xl font-bold mb-2 dark:text-white light:text-gray-900">Bienvenue sur DeutschMeister !</h2>
          <p className="text-gray-400 text-sm mb-4">Comment t'appelles-tu ?</p>
          <input
            type="text"
            id="userNameInput"
            placeholder="Ton prénom ou pseudo"
            className="w-full p-3 bg-[#1c2030] dark:bg-[#1c2030] light:bg-gray-100 border border-[#2a2e3a] dark:border-[#2a2e3a] light:border-gray-300 rounded-xl text-white dark:text-white light:text-gray-900 mb-4 outline-none focus:border-yellow-500"
            onKeyPress={(e) => e.key === 'Enter' && setUserName(e.target.value)}
          />
          <button
            onClick={() => {
              const input = document.getElementById('userNameInput');
              setUserName(input?.value || 'Apprenant');
            }}
            className="w-full py-3 bg-yellow-500 text-black rounded-xl font-bold hover:bg-yellow-400 transition"
          >
            Commencer l'aventure !
          </button>
        </div>
      </div>
    );
  };

  // Notification Toast
  const NotificationToast = () => {
    if (!notification) return null;
    
    return (
      <div className={`fixed bottom-4 right-4 z-50 p-4 rounded-xl shadow-lg animate-slide-up ${
        notification.type === 'success' ? 'bg-green-500 text-white' :
        notification.type === 'error' ? 'bg-red-500 text-white' :
        'bg-yellow-500 text-black'
      }`}>
        {notification.message}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-[#0d0f14] flex items-center justify-center z-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-yellow-400 mx-auto mb-4" />
          <p className="text-gray-400">Chargement de votre progression...</p>
        </div>
      </div>
    );
  }

  return (
    <UserContext.Provider value={{
      userData,
      updateExerciseResult,
      isLevelUnlocked,
      getCurrentLevelProgress,
      resetErrorsForLevel,
      getErrorsByLevel,
      jumpToLevel,
      addGamePoints,
      setUserName,
      updateLeaderboard,
      getLeaderboard,
      showNotification,
      toggleTheme,
      emergencySave,
      isOnline,
    }}>
      {children}
      <NameModal />
      <NotificationToast />
    </UserContext.Provider>
  );
};