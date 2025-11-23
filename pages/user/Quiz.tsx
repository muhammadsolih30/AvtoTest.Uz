import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getQuestions, saveResult } from '../../services/db';
import { Question, TestResult, TestResultDetail } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { Clock, ChevronRight, Timer } from 'lucide-react';

const Quiz: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, updateUserProfile } = useAuth();
  const { t } = useUI();
  
  const count = parseInt(searchParams.get('count') || '20');
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [totalTime, setTotalTime] = useState(0);
  const [questionTime, setQuestionTime] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize Questions
  useEffect(() => {
    const allQuestions = getQuestions();
    // Shuffle and slice
    const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count);
    
    // If we don't have enough questions, just use what we have or repeat
    if (selected.length === 0) {
      alert(t('quiz_empty'));
      navigate('/user');
      return;
    }
    
    setQuestions(selected);
    setLoading(false);
  }, [count, navigate]);

  // Total Timer
  useEffect(() => {
    if (isFinished) return;
    const timer = setInterval(() => setTotalTime(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [isFinished]);

  // Question Timer (Resets on current index change)
  useEffect(() => {
    setQuestionTime(0);
    if (isFinished) return;
    const qTimer = setInterval(() => setQuestionTime(prev => prev + 1), 1000);
    return () => clearInterval(qTimer);
  }, [currentIndex, isFinished]);

  const handleFinish = useCallback(() => {
    if (!user || isFinished) return;
    setIsFinished(true);

    // Calculate results
    let correctCount = 0;
    const details: TestResultDetail[] = questions.map(q => {
      const userAnswer = answers[q.id] || '';
      const isCorrect = userAnswer === q.correctAnswer;
      if (isCorrect) correctCount++;
      return {
        questionId: q.id,
        userAnswer,
        correctAnswer: q.correctAnswer,
        isCorrect
      };
    });

    const scorePercentage = Math.round((correctCount / questions.length) * 100);

    const result: TestResult = {
      id: Date.now().toString(),
      userId: user.id,
      date: new Date().toISOString(),
      totalQuestions: questions.length,
      correctCount,
      scorePercentage,
      timeSpentSeconds: totalTime,
      details
    };

    saveResult(result);

    // Update local user context with new points immediately
    const addedPoints = scorePercentage; 
    updateUserProfile({
      ...user,
      totalPoints: (user.totalPoints || 0) + addedPoints
    });

    navigate('/result', { state: { result } });
  }, [answers, questions, totalTime, user, isFinished, navigate, updateUserProfile]);

  const handleSelectAnswer = (optionKey: string) => {
    // Prevent changing answer once selected (Immediate feedback mode)
    const currentQ = questions[currentIndex];
    if (answers[currentQ.id]) return;

    setAnswers(prev => ({ ...prev, [currentQ.id]: optionKey }));
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) return <div className="p-10 text-center dark:text-white">Loading...</div>;

  const currentQuestion = questions[currentIndex];
  const userAnswer = answers[currentQuestion.id]; // Current answer for this question
  const isAnswered = !!userAnswer;

  return (
    <div className="max-w-3xl mx-auto p-4 pb-20">
      {/* Header / Stats */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 mb-6 flex justify-between items-center sticky top-16 z-40 transition-colors">
        <div className="flex gap-4">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-mono font-bold text-sm sm:text-base">
            <Clock className="text-blue-600 dark:text-blue-400" size={18} />
            {t('quiz_total_time')}: {formatTime(totalTime)}
          </div>
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-mono font-bold text-sm sm:text-base">
            <Timer className="text-orange-600 dark:text-orange-400" size={18} />
            {t('quiz_q_time')}: {formatTime(questionTime)}
          </div>
        </div>
        <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {t('quiz_q_of')}: <span className="text-slate-900 dark:text-white">{currentIndex + 1}</span> / {questions.length}
        </div>
      </div>

      {/* Progress Circles */}
      <div className="flex flex-wrap gap-1.5 mb-6 justify-center">
        {questions.map((q, idx) => {
          const ans = answers[q.id];
          const isCorrect = ans === q.correctAnswer;
          
          let colorClass = 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-400 dark:text-slate-500'; // Default
          
          if (ans) {
             // Immediate feedback style for progress circles
             colorClass = isCorrect 
               ? 'bg-green-500 border-green-500 text-white' 
               : 'bg-red-500 border-red-500 text-white';
          } else if (idx === currentIndex) {
             colorClass = 'ring-2 ring-blue-500 border-blue-500 text-blue-600 dark:text-blue-400 font-bold';
          }

          return (
            <div 
              key={q.id}
              onClick={() => { if (ans || idx <= currentIndex) setCurrentIndex(idx); }}
              className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs cursor-pointer transition-all ${colorClass}`}
            >
              {idx + 1}
            </div>
          );
        })}
      </div>

      {/* Question Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
        {currentQuestion.image && (
          <div className="w-full h-48 sm:h-64 bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden border-b border-slate-100 dark:border-slate-600">
            <img src={currentQuestion.image} alt="Question" className="max-w-full max-h-full object-contain" />
          </div>
        )}
        
        <div className="p-6">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-6 leading-relaxed">
            {currentQuestion.questionText}
          </h2>

          <div className="space-y-3">
            {(['A', 'B', 'C', 'D'] as const).map((optionKey) => {
              // Immediate Feedback Logic
              let buttonStyle = 'border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'; // Default
              let badgeStyle = 'border-slate-300 dark:border-slate-500 text-slate-500 dark:text-slate-400';
              let textStyle = 'text-slate-700 dark:text-slate-200';

              if (isAnswered) {
                if (optionKey === currentQuestion.correctAnswer) {
                  // Always show correct answer in Green
                  buttonStyle = 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-900 dark:text-green-100';
                  badgeStyle = 'bg-green-500 border-green-500 text-white';
                  textStyle = 'text-green-900 dark:text-green-100';
                } else if (optionKey === userAnswer) {
                  // If user selected this and it's wrong
                  buttonStyle = 'border-red-500 bg-red-50 dark:bg-red-900/30 text-red-900 dark:text-red-100';
                  badgeStyle = 'bg-red-500 border-red-500 text-white';
                  textStyle = 'text-red-900 dark:text-red-100';
                } else {
                  // Other incorrect options fade out slightly
                  buttonStyle = 'border-slate-100 dark:border-slate-800 opacity-50';
                  textStyle = 'text-slate-500 dark:text-slate-500';
                }
              }

              return (
                <button
                  key={optionKey}
                  onClick={() => handleSelectAnswer(optionKey)}
                  disabled={isAnswered}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3 ${buttonStyle}`}
                >
                  <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${badgeStyle}`}>
                    {optionKey}
                  </span>
                  <span className={textStyle}>{currentQuestion.options[optionKey]}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4 flex justify-end items-center z-50 max-w-5xl mx-auto transition-colors">
        {currentIndex === questions.length - 1 ? (
          <button
            onClick={handleFinish}
            disabled={!isAnswered}
            className="bg-green-600 text-white px-6 py-2.5 rounded-lg font-bold shadow-lg shadow-green-200 dark:shadow-none hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('quiz_finish')}
          </button>
        ) : (
          <button
            onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-colors flex items-center gap-1"
          >
            {t('quiz_next')} <ChevronRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

export default Quiz;