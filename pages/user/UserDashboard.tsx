import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, History, Trophy } from 'lucide-react';
import { getResults } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { TestResult } from '../../types';

const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useUI();
  const [history, setHistory] = useState<TestResult[]>([]);
  const [questionCount, setQuestionCount] = useState(20);

  useEffect(() => {
    if (user) {
      setHistory(getResults(user.id));
    }
  }, [user]);

  const startTest = () => {
    navigate(`/quiz?count=${questionCount}`);
  };

  const lastResult = history.length > 0 ? history[0] : null;
  const averageScore = history.length > 0 
    ? Math.round(history.reduce((acc, curr) => acc + curr.scorePercentage, 0) / history.length) 
    : 0;

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Start Test Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 transition-colors">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Play className="text-blue-600 dark:text-blue-400" />
            {t('dash_start')}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            {t('dash_start_desc')}
          </p>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t('dash_select_count')} <span className="text-blue-600 dark:text-blue-400 font-bold">{questionCount}</span>
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(num => (
                <button
                  key={num}
                  onClick={() => setQuestionCount(num)}
                  className={`py-2 rounded-lg text-sm font-medium transition-all ${
                    questionCount === num
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={startTest}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 dark:shadow-none hover:scale-[1.02] transition-all"
          >
            {t('dash_start_btn')}
          </button>
        </div>

        {/* Stats Card */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 transition-colors">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Trophy className="text-yellow-500" />
              {t('dash_stats')}
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-xl">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{t('dash_total_tests')}</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-white">{history.length}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-xl">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{t('dash_avg_score')}</p>
                <p className={`text-2xl font-bold ${averageScore >= 80 ? 'text-green-600 dark:text-green-400' : averageScore >= 60 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                  {averageScore}%
                </p>
              </div>
            </div>

            {lastResult && (
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-2">{t('dash_last_attempt')}</p>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white">{lastResult.scorePercentage}%</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(lastResult.date).toLocaleDateString()}</p>
                  </div>
                  <button 
                    onClick={() => navigate('/history')}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {t('dash_view_history')}
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => navigate('/history')}
            className="w-full py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
          >
            <History size={20} />
            {t('dash_full_history_btn')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;