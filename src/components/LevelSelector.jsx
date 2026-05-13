import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Lock, CheckCircle, Star, BookOpen, Sparkles, Languages, Zap, Shield, AlignLeft, BookMarked } from 'lucide-react';

const EXERCISE_CONFIG = [
  { id: 'article', name: 'Articles (der/die/das)', icon: BookMarked, color: 'blue', levels: 50 },
  { id: 'adjective', name: 'Adjectifs', icon: Sparkles, color: 'purple', levels: 50 },
  { id: 'conjugation', name: 'Conjugaison', icon: Languages, color: 'green', levels: 50 },
  { id: 'modal', name: 'Verbes modaux', icon: Zap, color: 'orange', levels: 50 },
  { id: 'passive', name: 'Passif', icon: Shield, color: 'red', levels: 50 },
  { id: 'wordorder', name: 'Ordre des mots', icon: AlignLeft, color: 'teal', levels: 50 },
  { id: 'participial', name: 'Partizipialsätze', icon: BookOpen, color: 'purple', levels: 50 },
];

const LevelSelector = () => {
  const { userData, isLevelUnlocked, jumpToLevel } = useUser();
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState('article');
  
  const currentConfig = EXERCISE_CONFIG.find(c => c.id === selectedType);
  
  // Récupération sécurisée des niveaux
  const currentLevels = userData.levels?.[selectedType]?.levelProgress || {};
  
  const getLevelStatus = (level) => {
    const levelKey = `level${level}`;
    const progress = currentLevels[levelKey] || { correct: 0, total: 0, errors: [] };
    const isUnlocked = isLevelUnlocked(selectedType, level);
    const completed = progress.total >= 10 && (progress.correct / progress.total) >= 0.8;
    const stars = progress.total > 0 ? Math.floor((progress.correct / progress.total) * 3) : 0;
    const successRate = progress.total > 0 ? Math.round((progress.correct / progress.total) * 100) : 0;
    
    return { isUnlocked, completed, stars, successRate };
  };
  
  const handlePlayLevel = (level) => {
    const status = getLevelStatus(level);
    if (status.isUnlocked) {
      navigate(`/exercises?type=${selectedType}&level=${level}`);
    }
  };
  
  // Calcul du pourcentage global
  let totalCompleted = 0;
  for (let i = 1; i <= 50; i++) {
    if (getLevelStatus(i).completed) totalCompleted++;
  }
  const globalProgress = (totalCompleted / 50) * 100;
  
  // Calcul des points totaux
  const totalXp = userData.xp || 0;
  const currentLevelNum = userData.levels?.[selectedType]?.currentLevel || 1;
  
  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* En-tête */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">🗺️ Sélection des niveaux</h1>
        <p className="text-gray-400 text-sm mb-4">Chaque niveau nécessite 80% de réussite pour débloquer le suivant</p>
        
        {/* Stats utilisateur */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-[#151820] border border-[#2a2e3a] rounded-xl p-3 text-center">
            <div className="text-xl font-bold text-yellow-400">{totalXp}</div>
            <div className="text-xs text-gray-500">XP totaux</div>
          </div>
          <div className="bg-[#151820] border border-[#2a2e3a] rounded-xl p-3 text-center">
            <div className="text-xl font-bold text-green-400">{totalCompleted}/50</div>
            <div className="text-xs text-gray-500">Niveaux complétés</div>
          </div>
          <div className="bg-[#151820] border border-[#2a2e3a] rounded-xl p-3 text-center">
            <div className="text-xl font-bold text-orange-400">{userData.streak || 0}</div>
            <div className="text-xs text-gray-500">Série 🔥</div>
          </div>
        </div>
        
        {/* Barre progression globale */}
        <div className="bg-[#151820] border border-[#2a2e3a] rounded-xl p-3">
          <div className="flex justify-between text-sm mb-1">
            <span>Progression globale</span>
            <span className="text-yellow-400 font-bold">{Math.round(globalProgress)}%</span>
          </div>
          <div className="h-2 bg-[#2a2e3a] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full transition-all duration-500" style={{ width: `${globalProgress}%` }} />
          </div>
        </div>
      </div>
      
      {/* Sélecteur de type d'exercice */}
      <div className="flex flex-wrap gap-2 mb-6">
        {EXERCISE_CONFIG.map((type) => (
          <button
            key={type.id}
            onClick={() => setSelectedType(type.id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-medium transition ${
              selectedType === type.id 
                ? `bg-${type.color}-500/20 text-${type.color}-400 border border-${type.color}-500/30` 
                : 'bg-[#1c2030] text-gray-400 hover:bg-[#242840]'
            }`}
          >
            <type.icon className="w-4 h-4" />
            <span className="text-xs hidden sm:inline">{type.name}</span>
          </button>
        ))}
      </div>
      
      {/* Info type sélectionné */}
      <div className="mb-4 p-3 bg-[#1c2030] rounded-xl">
        <p className="text-sm text-gray-400">
          📚 <span className="text-white font-medium">{currentConfig?.name}</span> — 
          Niveau actuel : <span className="text-yellow-400 font-bold">{currentLevelNum}</span>/50
        </p>
      </div>
      
      {/* Grille des niveaux */}
      <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
        {[...Array(50)].map((_, i) => {
          const level = i + 1;
          const status = getLevelStatus(level);
          
          let bgClass = 'bg-[#1c2030] border border-[#2a2e3a]';
          let textClass = 'text-gray-400';
          
          if (status.isUnlocked) {
            bgClass = 'bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border border-yellow-500/30';
            textClass = 'text-white';
          }
          
          if (status.completed) {
            bgClass = 'bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 ring-1 ring-green-500/50';
          }
          
          return (
            <button
              key={level}
              onClick={() => handlePlayLevel(level)}
              disabled={!status.isUnlocked}
              className={`
                aspect-square rounded-xl flex flex-col items-center justify-center p-1 transition-all
                ${bgClass}
                ${status.isUnlocked ? 'hover:scale-105 cursor-pointer' : 'cursor-not-allowed opacity-50'}
              `}
            >
              <span className={`text-base font-bold ${textClass}`}>{level}</span>
              
              {status.completed && (
                <div className="flex items-center gap-0.5 mt-0.5">
                  {[...Array(3)].map((_, s) => (
                    <Star key={s} className={`w-2.5 h-2.5 ${s < status.stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} />
                  ))}
                </div>
              )}
              
              {!status.isUnlocked && (
                <Lock className="w-3 h-3 text-gray-500 mt-0.5" />
              )}
              
              {status.isUnlocked && !status.completed && status.successRate > 0 && (
                <div className="text-[9px] text-yellow-500/70 mt-0.5">{status.successRate}%</div>
              )}
            </button>
          );
        })}
      </div>
      
      {/* Légende */}
      <div className="mt-6 flex flex-wrap gap-4 justify-center text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-yellow-500/30 rounded border border-yellow-500/50"></div>
          <span className="text-gray-400">Débloqué</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-green-500/30 rounded border border-green-500/50 ring-1 ring-green-500"></div>
          <span className="text-gray-400">Complété (80%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-[#1c2030] rounded border border-[#2a2e3a]"></div>
          <span className="text-gray-400">Verrouillé</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
          <span className="text-gray-400">Étoiles</span>
        </div>
      </div>
    </div>
  );
};

export default LevelSelector;