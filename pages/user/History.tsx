import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { getResults, getQuestions } from '../../services/db';
import { TestResult, Question } from '../../types';
import { ArrowLeft, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const History: React.FC = () => {
  const { user } = useAuth();
  const { t } = useUI();
  const navigate = useNavigate();
  const [results, setResults] = useState<TestResult[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [questionsMap, setQuestionsMap] = useState<Record<string, Question>>({});

  useEffect(() => {
    if (user) {
      setResults(getResults(user.id));
    }
    const qs = getQuestions();
    const map: Record<string, Question> = {};
    qs.forEach(q => map[q.id] = q);
    setQuestionsMap(map);
  }, [user]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="flex items-center mb-6">
        <button onClick={() => navigate('/user')} className="mr-4 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-slate-600 dark:text-slate-300" />
        </button>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{t('hist_title')}</h1>
      </div>

      <div className="space-y-4">
        {results.length === 0 ? (
          <div className="text-center py-12 text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
            {t('hist_empty')}
          </div>
        ) : (
          results.map(result => (
            <div key={result.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
              <div 
                onClick={() => toggleExpand(result.id)}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm border-2 ${
                    result.scorePercentage >= 85 
                      ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800' 
                      : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
                  }`}>
                    {result.scorePercentage}%
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs mb-1">
                      <Calendar size={12} />
                      {new Date(result.date).toLocaleString()}
                    </div>
                    <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                      {result.correctCount} / {result.totalQuestions} {t('hist_correct')}
                    </div>
                  </div>
                </div>
                {expandedId === result.id ? <ChevronUp size={20} className="text-slate-400"/> : <ChevronDown size={20} className="text-slate-400"/>}
              </div>

              {expandedId === result.id && (
                <div className="border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-4 space-y-4">
                  <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm mb-2">{t('hist_errors')}</h3>
                  {result.details.filter(d => !d.isCorrect).length === 0 ? (
                     <p className="text-green-600 dark:text-green-400 text-sm">Ajoyib! Xatolar yo'q.</p>
                  ) : (
                    result.details.filter(d => !d.isCorrect).map((detail, idx) => {
                      const q = questionsMap[detail.questionId];
                      if (!q) return null;
                      return (
                        <div key={idx} className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-red-100 dark:border-red-900/30 text-sm">
                          <p className="font-medium text-slate-800 dark:text-slate-200 mb-2">{q.questionText}</p>
                          <div className="flex gap-4 text-xs">
                            <span className="text-red-600 dark:text-red-400 font-semibold">❌ {t('hist_you')}: {detail.userAnswer || t('hist_no_answer')}</span>
                            <span className="text-green-600 dark:text-green-400 font-semibold">✅ {t('hist_correct')}: {q.options[q.correctAnswer]}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default History;