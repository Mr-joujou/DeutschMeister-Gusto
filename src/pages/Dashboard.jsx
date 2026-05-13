import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { Target, Trophy, Zap, Flame, TrendingUp, ChevronRight, Calendar, Star } from 'lucide-react';

const Dashboard = () => {
  const { userData, getCurrentLevelProgress } = useUser();
  const progress = getCurrentLevelProgress();
  const [dailyGoal, setDailyGoal] = useState({ current: 0, target: 5 });
  const [streakBonus, setStreakBonus] = useState(0);

  const precision = userData.totalAnswers > 0 
    ? Math.round((userData.totalCorrect / userData.totalAnswers) * 100) 
    : 0;

  // Charger l'objectif du jour depuis localStorage
  useEffect(() => {
    const today = new Date().toDateString();
    const saved = localStorage.getItem('daily_goal');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.date === today) {
        setDailyGoal({ current: parsed.current, target: 5 });
      }
    }
  }, []);

  // Mettre à jour l'objectif
  const updateDailyGoal = () => {
    const today = new Date().toDateString();
    const newCurrent = dailyGoal.current + 1;
    setDailyGoal({ ...dailyGoal, current: newCurrent });
    localStorage.setItem('daily_goal', JSON.stringify({ date: today, current: newCurrent }));
    
    if (newCurrent >= dailyGoal.target) {
      // Bonus de 50 XP pour objectif atteint
      // À implémenter avec updateExerciseResult
    }
  };

  const dailyProgress = (dailyGoal.current / dailyGoal.target) * 100;

  return (
    <div className="space-y-5 pb-20">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-[#1c2030] to-[#151820] rounded-2xl p-5 border border-[#2a2e3a]">
        <h1 className="text-xl font-bold mb-1">
          Bonjour, {userData.userName || 'Apprenant'} ! 👋
        </h1>
        <p className="text-gray-400 text-sm">
          Niveau {userData.currentLevel}/50
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#151820] border border-[#2a2e3a] rounded-xl p-3 text-center">
          <Zap className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
          <div className="text-xl font-bold text-yellow-400">{userData.xp}</div>
          <div className="text-xs text-gray-500">XP</div>
        </div>
        <div className="bg-[#151820] border border-[#2a2e3a] rounded-xl p-3 text-center">
          <Flame className="w-5 h-5 text-orange-400 mx-auto mb-1" />
          <div className="text-xl font-bold text-orange-400">{userData.streak}</div>
          <div className="text-xs text-gray-500">série</div>
        </div>
        <div className="bg-[#151820] border border-[#2a2e3a] rounded-xl p-3 text-center">
          <Trophy className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
          <div className="text-xl font-bold text-yellow-400">{precision}%</div>
          <div className="text-xs text-gray-500">précision</div>
        </div>
      </div>

      {/* Niveau actuel */}
      <div className="bg-[#151820] border border-[#2a2e3a] rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Progression niveau {userData.currentLevel}</span>
          <span className="text-sm text-yellow-400">{Math.round(progress.successRate)}%</span>
        </div>
        <div className="h-2 bg-[#2a2e3a] rounded-full overflow-hidden mb-2">
          <div 
            className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(progress.successRate, 100)}%` }}
          />
        </div>
        <p className="text-xs text-gray-500">
          {progress.correct}/{progress.total} exercices réussis (80% requis)
        </p>
      </div>

      {/* Objectif du jour */}
      <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-blue-400">Objectif du jour</span>
        </div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm">Terminer {dailyGoal.target} exercices</span>
          <span className="text-xs text-gray-400">{dailyGoal.current}/{dailyGoal.target}</span>
        </div>
        <div className="h-1.5 bg-[#2a2e3a] rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full transition-all duration-500"
            style={{ width: `${dailyProgress}%` }}
          />
        </div>
        {dailyGoal.current >= dailyGoal.target ? (
          <p className="text-xs text-green-400 mt-2">🎉 Objectif atteint ! +50 XP</p>
        ) : (
          <p className="text-xs text-gray-500 mt-2">Encore {dailyGoal.target - dailyGoal.current} exercice(s)</p>
        )}
      </div>

      {/* Actions rapides */}
      {/* <div className="space-y-3">
        <button 
          onClick={() => window.location.href = '/levels'}
          className="w-full py-4 bg-yellow-500 text-black rounded-xl font-bold flex items-center justify-between px-5 active:scale-[0.98] transition"
        >
          <span>🎯 Choisir un niveau</span>
          <ChevronRight className="w-5 h-5" />
        </button>
        
        <button 
          onClick={() => window.location.href = '/errors'}
          className="w-full py-4 bg-[#1c2030] text-gray-300 rounded-xl font-medium flex items-center justify-between px-5 active:scale-[0.98] transition"
        >
          <span>📝 Réviser mes erreurs</span>
          <ChevronRight className="w-5 h-5" />
        </button>

        <button 
          onClick={() => window.location.href = '/leaderboard'}
          className="w-full py-4 bg-[#1c2030] text-gray-300 rounded-xl font-medium flex items-center justify-between px-5 active:scale-[0.98] transition"
        >
          <span>🏆 Voir le classement</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div> */}

      {/* Citation du jour */}
      <div className="bg-[#151820] border border-[#2a2e3a] rounded-xl p-4 text-center">
        <p className="text-sm text-gray-400 italic">
          "Der Anfang ist die Hälfte des Ganzen."
        </p>
        <p className="text-xs text-gray-600 mt-1">— Le début est la moitié du tout</p>
      </div>
    </div>
  );
};

export default Dashboard;