
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { verifyAdminPassword, loginUser, registerUser, getUsers } from '../services/db';
import { Role } from '../types';
import { ArrowLeft, UserPlus, LogIn, Globe, Moon, Sun } from 'lucide-react';
import { languages } from '../services/translations';

const Login: React.FC = () => {
  const { role } = useParams<{ role: string }>();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t, toggleTheme, theme, language, setLanguage } = useUI();
  
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showLang, setShowLang] = useState(false);

  const isUser = role === 'user';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isUser) {
        if (!name.trim() || !password.trim()) {
          setError(t('error_fill_all'));
          return;
        }

        if (mode === 'register' && password.length < 4) {
          setError(t('error_pass_len'));
          return;
        }

        let user;
        if (mode === 'register') {
          user = registerUser(name, password);
        } else {
          user = loginUser(name, password);
        }
        
        login(user);
        navigate('/user');
      } else {
        // Admin Logic
        if (!verifyAdminPassword(password)) {
          setError(t('error_pass'));
          return;
        }
        // Find the Admin user in DB
        const users = getUsers();
        const adminUser = users.find(u => u.role === Role.ADMIN);
        
        if (adminUser) {
           login(adminUser);
           navigate('/admin');
        } else {
           setError("Admin topilmadi (Tizim xatosi)");
        }
      }
    } catch (err: any) {
      // Simple error mapping logic or direct display
      if(err.message.includes("mavjud")) setError(t('error_user_exists'));
      else if(err.message.includes("topilmadi")) setError(t('error_user_not_found'));
      else if(err.message.includes("noto'g'ri")) setError(t('error_pass'));
      else setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4 transition-colors">
      
      {/* Top Controls for Login Page since Navbar is hidden */}
      <div className="absolute top-4 right-4 flex gap-2">
         <button onClick={toggleTheme} className="p-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full shadow-sm">
            {theme === 'light' ? <Moon size={18}/> : <Sun size={18}/>}
         </button>
         <div className="relative">
            <button onClick={() => setShowLang(!showLang)} className="p-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full shadow-sm uppercase text-xs font-bold w-8 h-8 flex items-center justify-center">
              {language}
            </button>
            {showLang && (
              <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-100 dark:border-slate-700 z-20 py-1">
                {languages.map((l) => (
                  <button key={l.code} onClick={() => {setLanguage(l.code); setShowLang(false);}} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 dark:text-slate-200">
                    {l.flag} {l.label}
                  </button>
                ))}
              </div>
            )}
         </div>
      </div>

      <div className="max-w-sm w-full bg-white dark:bg-slate-800 rounded-xl shadow-lg dark:border dark:border-slate-700 p-6 transition-colors">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-6 hover:text-slate-800 dark:hover:text-slate-200"
        >
          <ArrowLeft size={16} className="mr-1" /> {t('btn_back')}
        </button>

        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">
          {isUser ? (mode === 'login' ? t('login_title') : t('register_title')) : t('admin_login')}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
          {isUser 
            ? (mode === 'login' ? t('login_desc') : t('register_desc')) 
            : t('admin_login_desc')}
        </p>

        {isUser && (
          <div className="flex p-1 bg-slate-100 dark:bg-slate-700 rounded-lg mb-6">
            <button 
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md flex items-center justify-center gap-2 transition-all ${mode === 'login' ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow' : 'text-slate-500 dark:text-slate-400'}`}
            >
              <LogIn size={14} /> {t('btn_login')}
            </button>
            <button 
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md flex items-center justify-center gap-2 transition-all ${mode === 'register' ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow' : 'text-slate-500 dark:text-slate-400'}`}
            >
              <UserPlus size={14} /> {t('btn_register')}
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isUser && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('name_label')}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder={t('name_placeholder')}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('pass_label')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:ring-2 outline-none ${isUser ? 'focus:ring-blue-500' : 'focus:ring-orange-500'}`}
              placeholder={mode === 'register' ? t('new_pass_placeholder') : t('pass_placeholder')}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 text-sm rounded-lg border border-red-100 dark:border-red-800">
              {error}
            </div>
          )}

          <button
            type="submit"
            className={`w-full py-2.5 rounded-lg font-medium text-white transition-colors ${
              isUser 
                ? 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-none' 
                : 'bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-200 dark:shadow-none'
            }`}
          >
            {isUser ? (mode === 'login' ? t('btn_login') : t('btn_register')) : t('btn_login')}
          </button>
        </form>
        
        <div className="text-center text-xs text-slate-400 dark:text-slate-500 mt-6 font-medium">
          {t('app_footer_credit')}
        </div>
      </div>
    </div>
  );
};

export default Login;
