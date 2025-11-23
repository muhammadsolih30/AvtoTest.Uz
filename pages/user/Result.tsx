import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { TestResult } from '../../types';
import { CheckCircle, XCircle, RotateCcw, Home, AlertTriangle } from 'lucide-react';
import { useUI } from '../../context/UIContext';

const Result: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useUI();
  const result = location.state?.result as TestResult;

  if (!result) {
    return <div className="p-10 text-center dark:text-white">Natija topilmadi.</div>;
  }

  const passed = result.scorePercentage >= 85;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center ${passed ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
          {passed ? <CheckCircle size={48} /> : <XCircle size={48} />}
        </div>
        
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            {passed ? t('res_congrats') : t('res_fail')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            {t('res_score_text', { total: result.totalQuestions, correct: result.correctCount })}
          </p>
        </div>

        <div className="text-5xl font-black text-slate-800 dark:text-white">
          {result.scorePercentage}%
        </div>

        <div className="flex justify-center gap-4 text-sm text-slate-500 dark:text-slate-400">
           <span>⏱️ {Math.floor(result.timeSpentSeconds / 60)}m {result.timeSpentSeconds % 60}s</span>
        </div>
      </div>

      <div className="grid gap-4">
        <button
          onClick={() => navigate('/history')}
          className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          <span className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300">
            <AlertTriangle className="text-orange-500" size={20}/> {t('res_analyze')}
          </span>
          <span className="text-slate-400">&rarr;</span>
        </button>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/user')}
            className="py-3 px-4 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:border-slate-300 dark:hover:border-slate-500"
          >
            <span className="flex items-center justify-center gap-2">
              <Home size={18}/> {t('res_home')}
            </span>
          </button>
          <button
            onClick={() => navigate('/quiz?count=20')}
            className="py-3 px-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-none"
          >
            <span className="flex items-center justify-center gap-2">
              <RotateCcw size={18}/> {t('res_retry')}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Result;