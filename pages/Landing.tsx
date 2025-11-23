import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Shield, User } from 'lucide-react';
import { useUI } from '../context/UIContext';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useUI();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 flex flex-col items-center justify-center p-6 transition-colors">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl dark:shadow-none dark:border dark:border-slate-700 p-8 space-y-8 transition-colors">
        <div className="text-center space-y-2">
          <div className="bg-blue-600 w-16 h-16 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-blue-900/50">
            <Car className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">{t('app_name')}</h1>
          <p className="text-slate-500 dark:text-slate-400">{t('app_desc')}</p>
        </div>

        <div className="grid gap-4">
          <button
            onClick={() => navigate('/login/user')}
            className="group relative flex items-center p-4 bg-white dark:bg-slate-700 border-2 border-slate-100 dark:border-slate-600 rounded-xl hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md transition-all"
          >
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full mr-4 group-hover:bg-blue-600 transition-colors">
              <User className="text-blue-600 dark:text-blue-400 group-hover:text-white w-6 h-6" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-slate-800 dark:text-white">{t('role_user')}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{t('role_user_desc')}</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/login/admin')}
            className="group relative flex items-center p-4 bg-white dark:bg-slate-700 border-2 border-slate-100 dark:border-slate-600 rounded-xl hover:border-orange-500 dark:hover:border-orange-400 hover:shadow-md transition-all"
          >
            <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-full mr-4 group-hover:bg-orange-600 transition-colors">
              <Shield className="text-orange-600 dark:text-orange-400 group-hover:text-white w-6 h-6" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-slate-800 dark:text-white">{t('role_admin')}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{t('role_admin_desc')}</p>
            </div>
          </button>
        </div>

        <div className="text-center text-xs text-slate-400 dark:text-slate-500 mt-8 font-medium">
          {t('app_footer_credit')}
        </div>
      </div>
    </div>
  );
};

export default Landing;