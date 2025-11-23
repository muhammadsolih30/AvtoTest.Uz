
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { LogOut, User as UserIcon, ShieldCheck, Moon, Sun, Globe, Award, Headphones, AlertCircle } from 'lucide-react';
import { Role } from '../types';
import { languages } from '../services/translations';
import { useNavigate } from 'react-router-dom';
import { getUnreadCount, getAdminId } from '../services/db';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, language, setLanguage, t } = useUI();
  const navigate = useNavigate();
  const [showLang, setShowLang] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    if (!user || user.role !== Role.USER) return;

    const checkUnread = () => {
      const count = getUnreadCount(user.id);
      setUnreadCount(count);
    };

    checkUnread();
    const interval = setInterval(checkUnread, 3000);
    return () => clearInterval(interval);
  }, [user]);

  if (!user) return null;

  const handleLogoutConfirm = () => {
    logout();
    setShowLogoutConfirm(false);
  };

  return (
    <>
      <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3 sticky top-0 z-50 transition-colors">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div 
               className="flex items-center gap-2 cursor-pointer"
               onClick={() => navigate('/profile')}
               title={t('prof_title')}
            >
              {user.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-600" />
              ) : (
                <div className="bg-blue-600 text-white p-2 rounded-full">
                  <UserIcon size={20} />
                </div>
              )}
              <div className="hidden sm:block">
                <h1 className="font-bold text-slate-800 dark:text-slate-100 leading-tight">AvtoTest Uz</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  {user.role === Role.ADMIN ? <ShieldCheck size={12} className="text-orange-500"/> : null}
                  {user.name}
                </p>
              </div>
            </div>
            
            {/* Nav Links */}
            <div className="hidden md:flex gap-2 ml-4">
               {user.role === Role.USER && (
                 <button onClick={() => navigate('/leaderboard')} className="px-3 py-1.5 text-sm rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center gap-1">
                   <Award size={16}/> {t('nav_leaderboard')}
                 </button>
               )}
               {user.role === Role.USER && (
                 <button onClick={() => navigate('/chat')} className="relative px-3 py-1.5 text-sm rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center gap-1">
                     <Headphones size={16}/> {t('nav_contact')}
                     {unreadCount > 0 && (
                       <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                         {unreadCount > 99 ? '99+' : unreadCount}
                       </span>
                     )}
                 </button>
               )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Nav Icons */}
            {user.role === Role.USER && (
               <button onClick={() => navigate('/chat')} className="relative md:hidden p-2 text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                 <Headphones size={20}/>
                 {unreadCount > 0 && (
                   <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center">
                     {unreadCount > 99 ? '99+' : unreadCount}
                   </span>
                 )}
               </button>
            )}
            
            {user.role === Role.USER && (
              <button onClick={() => navigate('/leaderboard')} className="md:hidden p-2 text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                <Award size={20}/>
              </button>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title="Toggle Theme"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            {/* Language Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowLang(!showLang)}
                className="p-2 rounded-lg text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-1"
              >
                <Globe size={20} />
                <span className="uppercase font-medium text-xs hidden sm:inline">{language}</span>
              </button>
              
              {showLang && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowLang(false)}></div>
                  <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-20 py-1">
                    {languages.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => { setLanguage(l.code); setShowLang(false); }}
                        className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 ${
                          language === l.code ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span>{l.flag}</span> {l.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <button 
              onClick={() => setShowLogoutConfirm(true)}
              className="text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 sm:px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">{t('logout')}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-700 transform scale-100 transition-all">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-4">
                 <AlertCircle size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Chiqish
              </h3>
              <p className="text-slate-500 dark:text-slate-400">
                Siz saytdan rostdan chiqmoqchimisiz?
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl font-medium transition-colors"
              >
                Yo'q
              </button>
              <button
                onClick={handleLogoutConfirm}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-200 dark:shadow-none transition-all"
              >
                Ha, chiqaman
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
