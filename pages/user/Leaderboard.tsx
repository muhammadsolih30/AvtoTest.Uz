import React, { useState, useEffect } from 'react';
import { useUI } from '../../context/UIContext';
import { getLeaderboard } from '../../services/db';
import { User } from '../../types';
import { Award, Calendar, User as UserIcon, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Leaderboard: React.FC = () => {
  const { t } = useUI();
  const navigate = useNavigate();
  const [period, setPeriod] = useState<'daily' | 'monthly' | 'yearly'>('daily');
  const [users, setUsers] = useState<(User & { periodScore: number })[]>([]);

  useEffect(() => {
    setUsers(getLeaderboard(period));
  }, [period]);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/user')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full dark:text-slate-300"><ArrowLeft /></button>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
           <Award className="text-yellow-500" /> {t('lead_title')}
        </h1>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-700">
          <button 
            onClick={() => setPeriod('daily')}
            className={`flex-1 py-4 font-medium text-sm transition-colors ${period === 'daily' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
          >
            {t('lead_daily')}
          </button>
          <button 
             onClick={() => setPeriod('monthly')}
             className={`flex-1 py-4 font-medium text-sm transition-colors ${period === 'monthly' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
          >
            {t('lead_monthly')}
          </button>
          <button 
             onClick={() => setPeriod('yearly')}
             className={`flex-1 py-4 font-medium text-sm transition-colors ${period === 'yearly' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
          >
            {t('lead_yearly')}
          </button>
        </div>

        {/* List */}
        <div className="p-0">
          {users.length === 0 ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-2">
              <Calendar size={32} className="opacity-50" />
              {t('lead_empty')}
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs uppercase text-slate-500 dark:text-slate-400 font-semibold">
                <tr>
                  <th className="p-4 w-16 text-center">{t('lead_rank')}</th>
                  <th className="p-4">{t('lead_user')}</th>
                  <th className="p-4 text-right">{t('lead_score')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {users.map((u, index) => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="p-4 text-center">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                    </td>
                    <td className="p-4 flex items-center gap-3">
                      {u.avatar ? (
                        <img src={u.avatar} alt="" className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-600" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-400">
                          <UserIcon size={20} />
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-slate-800 dark:text-white text-sm">{u.name}</p>
                        <p className="text-xs text-slate-500">{t('prof_total_points')}: {u.totalPoints}</p>
                      </div>
                    </td>
                    <td className="p-4 text-right font-mono font-bold text-blue-600 dark:text-blue-400">
                      {u.periodScore}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;