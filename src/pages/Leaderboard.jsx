import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { Trophy, Medal, User, Zap, TrendingUp, RefreshCw, Crown } from 'lucide-react';

const Leaderboard = () => {
  const { userData, getLeaderboard, updateLeaderboard } = useUser();
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Données mockées des autres utilisateurs (toujours les mêmes)
  const mockUsers = [
    { name: 'Abdellah', xp: 2840, level: 28, accuracy: 92 },
    { name: 'Sophia', xp: 2150, level: 22, accuracy: 88 },
    { name: 'Mehdi', xp: 1890, level: 19, accuracy: 85 },
    { name: 'Youssef', xp: 1560, level: 16, accuracy: 82 },
    { name: 'Fatima', xp: 1420, level: 14, accuracy: 79 },
    { name: 'Ilias', xp: 1280, level: 13, accuracy: 76 },
    { name: 'Nadia', xp: 1150, level: 12, accuracy: 74 },
    { name: 'Omar', xp: 980, level: 10, accuracy: 71 },
    { name: 'Leila', xp: 890, level: 9, accuracy: 68 },
    { name: 'Hicham', xp: 760, level: 8, accuracy: 65 },
    { name: 'Karim', xp: 650, level: 7, accuracy: 62 },
    { name: 'Samira', xp: 540, level: 6, accuracy: 59 },
    { name: 'Rachid', xp: 430, level: 5, accuracy: 55 },
    { name: 'Najat', xp: 320, level: 4, accuracy: 52 },
    { name: 'Tarik', xp: 210, level: 3, accuracy: 48 },
  ];

  useEffect(() => {
    // Données de l'utilisateur réel
    const realUser = {
      name: userData.userName || 'Gustave A.',
      xp: userData.xp,
      level: userData.currentLevel,
      accuracy: userData.totalAnswers > 0 ? Math.round((userData.totalCorrect / userData.totalAnswers) * 100) : 0,
      isCurrentUser: true,
    };
    
    // Fusionner tous les utilisateurs
    let allUsers = [...mockUsers, realUser];
    
    // Trier par XP (décroissant)
    allUsers.sort((a, b) => b.xp - a.xp);
    
    // Trouver la position de l'utilisateur
    const userIndex = allUsers.findIndex(u => u.isCurrentUser);
    const userPosition = userIndex + 1;
    
    let finalLeaderboard = [];
    
    if (userPosition <= 10) {
      // L'utilisateur est dans le top 10 : afficher les 10 premiers
      finalLeaderboard = allUsers.slice(0, 10);
    } else {
      // L'utilisateur n'est pas dans le top 10 : afficher les 9 premiers + l'utilisateur
      const top9 = allUsers.slice(0, 9);
      const user = allUsers[userIndex];
      
      // Créer une entrée séparatrice
      const separator = { 
        name: '...', 
        xp: '---', 
        level: '--', 
        accuracy: 0, 
        isSeparator: true 
      };
      
      finalLeaderboard = [...top9, separator, user];
    }
    
    setLeaderboard(finalLeaderboard);
    setIsLoading(false);
  }, [userData]);

  const getRankIcon = (rank, isSeparator) => {
    if (isSeparator) return null;
    if (rank === 0) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (rank === 1) return <Medal className="w-5 h-5 text-gray-300" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-amber-600" />;
    return null;
  };

  const getRankBadge = (rank) => {
    if (rank === 0) return <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-bold">🏆 1er</span>;
    if (rank === 1) return <span className="px-2 py-0.5 bg-gray-500/20 text-gray-300 rounded-full text-xs font-bold">🥈 2e</span>;
    if (rank === 2) return <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full text-xs font-bold">🥉 3e</span>;
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-yellow-400" />
      </div>
    );
  }

  // Trouver le rang réel de l'utilisateur dans le classement complet
  const allUsersSorted = [...mockUsers, { 
    name: userData.userName || 'Gustave A.', 
    xp: userData.xp, 
    level: userData.currentLevel 
  }].sort((a, b) => b.xp - a.xp);
  
  const realUserRank = allUsersSorted.findIndex(u => u.name === (userData.userName || 'Gustave A.')) + 1;
  const isInTop10 = realUserRank <= 10;

  return (
    <div className="max-w-2xl mx-auto pb-20">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl p-6 border border-yellow-500/30 mb-6 text-center">
        <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
        <h1 className="text-2xl font-bold mb-2">🏆 Classement</h1>
        <p className="text-gray-400 text-sm">Comparez votre progression avec les autres apprenants</p>
      </div>

      {/* Stats personnelles */}
      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-400">Votre position</span>
          <div className="flex items-center gap-2">
            {realUserRank <= 3 && realUserRank > 0 && getRankBadge(realUserRank - 1)}
            <span className={`text-sm font-bold ${realUserRank <= 10 ? 'text-yellow-400' : 'text-gray-400'}`}>
              #{realUserRank} / {allUsersSorted.length}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <User className="w-4 h-4 text-blue-400 mx-auto mb-1" />
            <span className="text-lg font-bold text-white">{userData.userName || 'Gustave A.'}</span>
            <p className="text-xs text-gray-500">Apprenant</p>
          </div>
          <div>
            <Zap className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
            <span className="text-lg font-bold text-yellow-400">{userData.xp}</span>
            <p className="text-xs text-gray-500">XP</p>
          </div>
          <div>
            <TrendingUp className="w-4 h-4 text-green-400 mx-auto mb-1" />
            <span className="text-lg font-bold text-green-400">
              {userData.totalAnswers > 0 ? Math.round((userData.totalCorrect / userData.totalAnswers) * 100) : 0}%
            </span>
            <p className="text-xs text-gray-500">Précision</p>
          </div>
        </div>
      </div>

      {/* Liste du classement (10 meilleurs seulement) */}
      <div className="bg-[#151820] border border-[#2a2e3a] rounded-xl overflow-hidden">
        <div className="p-3 border-b border-[#2a2e3a] bg-[#1c2030]">
          <div className="grid grid-cols-12 text-xs text-gray-500 font-medium">
            <div className="col-span-2">Rang</div>
            <div className="col-span-5">Apprenant</div>
            <div className="col-span-3 text-center">XP</div>
            <div className="col-span-2 text-right">Niv.</div>
          </div>
        </div>
        
        <div className="divide-y divide-[#2a2e3a] max-h-96 overflow-y-auto">
          {leaderboard.map((user, idx) => {
            if (user.isSeparator) {
              return (
                <div key="separator" className="p-3 text-center text-gray-500 text-sm italic">
                  ⋮ ⋮ ⋮
                </div>
              );
            }
            
            const rank = idx + 1;
            const isUser = user.isCurrentUser;
            
            return (
              <div 
                key={user.name}
                className={`p-3 transition ${isUser ? 'bg-yellow-500/10 border-l-2 border-yellow-400' : 'hover:bg-[#1c2030]'}`}
              >
                <div className="grid grid-cols-12 items-center">
                  <div className="col-span-2 flex items-center gap-1">
                    {getRankIcon(idx, false)}
                    <span className={`text-sm ${rank <= 3 ? 'font-bold' : ''}`}>
                      {rank}
                    </span>
                  </div>
                  <div className="col-span-5 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-600 flex items-center justify-center text-black text-xs font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className={`text-sm ${isUser ? 'text-yellow-400 font-bold' : 'text-gray-300'}`}>
                      {user.name}
                      {isUser && <span className="text-xs text-gray-500 ml-1">(vous)</span>}
                    </span>
                  </div>
                  <div className="col-span-3 text-center">
                    <span className="text-sm font-medium text-yellow-400">{user.xp}</span>
                  </div>
                  <div className="col-span-2 text-right">
                    <span className="text-sm text-gray-400">{user.level}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {leaderboard.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <p>Aucun classement pour le moment</p>
            <p className="text-xs mt-2">Complétez des exercices pour apparaître ici !</p>
          </div>
        )}
      </div>
      
      {/* Message d'information sur le classement */}
      <div className="mt-6 p-3 bg-[#1c2030] rounded-xl">
        <p className="text-xs text-gray-400 text-center">
          📊 Le classement affiche les <span className="text-yellow-400 font-bold">10 meilleurs apprenants</span>.
          {!isInTop10 && (
            <span className="block mt-1 text-yellow-500/80">
              👑 Vous êtes actuellement #{realUserRank} — Continuez vos exercices pour entrer dans le top 10 !
            </span>
          )}
          {isInTop10 && realUserRank > 0 && (
            <span className="block mt-1 text-green-400">
              🎉 Félicitations ! Vous êtes dans le top 10 !
            </span>
          )}
        </p>
      </div>
      
      <div className="flex justify-between items-center mt-4">
        <p className="text-xs text-gray-500">
          💡 Le classement se base sur vos XP totaux. Continuez vos exercices pour grimper !
        </p>
        <button 
          onClick={() => window.location.reload()} 
          className="p-2 hover:bg-[#1c2030] rounded-xl transition"
          title="Rafraîchir"
        >
          <RefreshCw className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    </div>
  );
};

export default Leaderboard;