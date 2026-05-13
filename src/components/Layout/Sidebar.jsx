import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import logo from '../../assets/logo.png';  // ← IMPORT DE TON LOGO
import { 
  BookOpen, 
  Gamepad2, 
  User, 
  Trophy,
  Zap,
  Target,
  X,
  Map,
  ChevronDown,
  ChevronRight,
  BookMarked,
  Sparkles,
  Sun,
  Moon,
  Languages,
  Shield,
  AlignLeft,
  MessageSquare,
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { userData, toggleTheme } = useUser();
  const [exercisesOpen, setExercisesOpen] = useState(false);
  const isLight = userData.theme === 'light';

  // Bloquer le scroll du body quand le sidebar mobile est ouvert
  React.useEffect(() => {
    if (isOpen) {
      document.body.classList.add('sidebar-open');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.classList.remove('sidebar-open');
      document.body.style.overflow = '';
    }
    return () => {
      document.body.classList.remove('sidebar-open');
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const menuItems = [ 
    { path: '/passive-game', label: 'Exercices Passif', icon: Shield, color: 'text-red-400' },
    { path: '/participial', label: 'Partizipialsätze', icon: Gamepad2, color: 'text-purple-400' },
    { path: '/sprechen-schreiben', label: 'Sprechen & Schreiben', icon: MessageSquare, color: 'text-yellow-400' },
    { path: '/levels', label: 'Sélection des niveaux', icon: Map, color: 'text-green-400' },
    { path: '/leaderboard', label: 'Classement', icon: Trophy, color: 'text-yellow-400' },
    { path: '/profile', label: 'Profil', icon: User, color: 'text-purple-400' },
  ];

  const exerciseTypes = [
    { id: 'article', name: 'Articles (der/die/das)', icon: BookMarked, color: 'blue', description: 'Déclinaison des articles' },
    { id: 'adjective', name: 'Adjectifs', icon: Sparkles, color: 'purple', description: 'Déclinaison des adjectifs' },
    { id: 'conjugation', name: 'Conjugaison', icon: Languages, color: 'green', description: 'Conjugaison des verbes' },
    { id: 'modal', name: 'Verbes modaux', icon: Zap, color: 'orange', description: 'können, müssen, dürfen, wollen, sollen' },
    { id: 'wordorder', name: 'Ordre des mots', icon: AlignLeft, color: 'teal', description: 'Structure de la phrase' },
  ];

  const getNavLinkClass = ({ isActive }) => {
    return `flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
      isActive 
        ? 'bg-gray-100 dark:bg-[#242840] text-gray-900 dark:text-white border-l-2 border-yellow-400' 
        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1c2030] hover:text-gray-700 dark:hover:text-gray-200'
    }`;
  };

  const getExerciseLinkClass = ({ isActive }, type) => {
    const colorClasses = {
      blue: isActive ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1c2030] hover:text-gray-700 dark:hover:text-gray-200',
      purple: isActive ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1c2030] hover:text-gray-700 dark:hover:text-gray-200',
      green: isActive ? 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1c2030] hover:text-gray-700 dark:hover:text-gray-200',
      orange: isActive ? 'bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1c2030] hover:text-gray-700 dark:hover:text-gray-200',
      red: isActive ? 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1c2030] hover:text-gray-700 dark:hover:text-gray-200',
      teal: isActive ? 'bg-teal-100 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1c2030] hover:text-gray-700 dark:hover:text-gray-200',
    };
    return `flex items-center gap-3 px-4 py-2 rounded-xl transition group ${colorClasses[type.color]}`;
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/70 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar fixe (ne défile pas) */}
      <div className={`
        fixed top-0 left-0 h-full w-72 bg-white dark:bg-[#151820] border-r border-gray-200 dark:border-[#2a2e3a]
        flex flex-col z-50 transition-transform duration-300 ease-out overflow-y-auto
        ${isOpen ? 'transform translate-x-0' : 'transform -translate-x-full'}
        lg:relative lg:translate-x-0 lg:overflow-y-auto lg:h-screen lg:sticky lg:top-0
      `}>
        {/* En-tête avec LOGO IMAGE */}
        <div className="p-5 border-b border-gray-200 dark:border-[#2a2e3a] flex items-center justify-between sticky top-0 bg-white dark:bg-[#151820] z-10">
          <div className="flex items-center gap-3">
            {/* Ton logo image */}
            <img 
              src={logo} 
              alt="DeutschMeister Logo" 
              className="w-10 h-10 rounded-xl object-cover"
            />
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                Deutsch<span className="text-white">&amp;</span>Meister
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-500">Apprendre l'allemand facilement</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-[#1c2030] rounded-xl transition"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Navigation - scrollable si nécessaire */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-1">
            <div>
              <button
                onClick={() => setExercisesOpen(!exercisesOpen)}
                className={`
                  w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200
                  text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1c2030] hover:text-gray-900 dark:hover:text-gray-200
                `}
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5" />
                  <span className="font-medium">📚 Exercices</span>
                </div>
                {exercisesOpen ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
              
              {exercisesOpen && (
                <div className="ml-7 mt-1 space-y-1 border-l border-gray-200 dark:border-[#2a2e3a] pl-3">
                  {exerciseTypes.map((type) => (
                    <NavLink
                      key={type.id}
                      to={`/exercises?type=${type.id}`}
                      onClick={() => { if (window.innerWidth < 1024) onClose(); }}
                      className={({ isActive }) => getExerciseLinkClass({ isActive }, type)}
                    >
                      <type.icon className="w-4 h-4" />
                      <div className="flex-1">
                        <span className="text-sm font-medium">{type.name}</span>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500">{type.description}</p>
                      </div>
                      {({ isActive }) => isActive && (
                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-400"></div>
                      )}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>

            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => { if (window.innerWidth < 1024) onClose(); }}
                className={getNavLinkClass}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium text-sm">{item.label}</span>
                </div>
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Footer : Thème + Objectif - fixe en bas */}
        <div className="p-4 border-t border-gray-200 dark:border-[#2a2e3a] space-y-3 sticky bottom-0 bg-white dark:bg-[#151820]">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between p-3 bg-gray-100 dark:bg-[#1c2030] rounded-xl hover:bg-gray-200 dark:hover:bg-[#242840] transition"
          >
            <div className="flex items-center gap-3">
              {isLight ? <Moon className="w-4 h-4 text-purple-400" /> : <Sun className="w-4 h-4 text-yellow-400" />}
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Mode {isLight ? 'sombre' : 'clair'}
              </span>
            </div>
            <span className="text-xs text-gray-500">{isLight ? '🌙' : '☀️'}</span>
          </button>

          <div className="bg-gray-100 dark:bg-[#1c2030] rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-yellow-400" />
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Objectif du jour</span>
            </div>
            <div className="text-sm mb-2 dark:text-gray-300">Terminer 5 exercices</div>
            <div className="h-1.5 bg-gray-300 dark:bg-[#2a2e3a] rounded-full overflow-hidden">
              <div className="h-full w-2/5 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full"></div>
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
              <span>2/5 complétés</span>
              <Zap className="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;