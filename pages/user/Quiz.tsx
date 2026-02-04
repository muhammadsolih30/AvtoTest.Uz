import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getQuestions, getQuestionsByCategory } from '../../services/db';
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
  const topic = searchParams.get('topic'); // Topikni URL parametridan olamiz
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [totalTime, setTotalTime] = useState(0);
  const [questionTime, setQuestionTime] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize Questions
  useEffect(() => {
    // Agar topic bo'lsa, faqat o'sha kategoriya savollarini olamiz
    const allQuestions = topic ? getQuestionsByCategory(topic) : getQuestions();
    
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
  }, [count, topic, navigate, t]);

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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-600 dark:text-slate-400">Yuklanmoqda...</p>
      </div>
    </div>
  );

  const currentQuestion = questions[currentIndex];
  const userAnswer = answers[currentQuestion.id]; // Current answer for this question
  const isAnswered = !!userAnswer;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
      <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4">
        {/* Header / Stats */}
        <div className="bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-3 sm:p-4 mb-4 sm:mb-6 sticky top-2 sm:top-4 z-40 transition-colors">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
            <div className="flex flex-wrap gap-2 sm:gap-4 w-full sm:w-auto">
              <div className="flex items-center gap-1.5 sm:gap-2 text-slate-700 dark:text-slate-300 font-mono font-bold text-xs sm:text-sm">
                <Clock className="text-blue-600 dark:text-blue-400 flex-shrink-0" size={16} />
                <span className="whitespace-nowrap">{formatTime(totalTime)}</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 text-slate-700 dark:text-slate-300 font-mono font-bold text-xs sm:text-sm">
                <Timer className="text-orange-600 dark:text-orange-400 flex-shrink-0" size={16} />
                <span className="whitespace-nowrap">{formatTime(questionTime)}</span>
              </div>
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full">
              {currentIndex + 1} / {questions.length}
            </div>
          </div>
        </div>

        {/* Progress Circles */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-6 justify-center px-2">
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
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border flex items-center justify-center text-[10px] sm:text-xs cursor-pointer transition-all ${colorClass} ${ans || idx <= currentIndex ? '' : 'opacity-50'}`}
              >
                {idx + 1}
              </div>
            );
          })}
        </div>

        {/* Question Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
          {currentQuestion.image && (
            <div className="w-full h-48 sm:h-56 md:h-64 bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden border-b border-slate-200 dark:border-slate-600">
              <img 
                src={currentQuestion.image} 
                alt="Question" 
                className="max-w-full max-h-full object-contain"
              />
            </div>
          )}
          
          <div className="p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-white mb-4 sm:mb-6 leading-relaxed">
              {currentQuestion.questionText}
            </h2>

            <div className="space-y-2 sm:space-y-3">
              {(['A', 'B', 'C', 'D'] as const).map((optionKey) => {
                // Immediate Feedback Logic
                let buttonStyle = 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-98'; // Default
                let badgeStyle = 'border-slate-300 dark:border-slate-500 text-slate-500 dark:text-slate-400';
                let textStyle = 'text-slate-700 dark:text-slate-200';

                if (isAnswered) {
                  if (optionKey === currentQuestion.correctAnswer) {
                    // Always show correct answer in Green
                    buttonStyle = 'border-green-500 bg-green-50 dark:bg-green-900/30';
                    badgeStyle = 'bg-green-500 border-green-500 text-white';
                    textStyle = 'text-green-900 dark:text-green-100 font-medium';
                  } else if (optionKey === userAnswer) {
                    // If user selected this and it's wrong
                    buttonStyle = 'border-red-500 bg-red-50 dark:bg-red-900/30';
                    badgeStyle = 'bg-red-500 border-red-500 text-white';
                    textStyle = 'text-red-900 dark:text-red-100 font-medium';
                  } else {
                    // Other incorrect options fade out slightly
                    buttonStyle = 'border-slate-200 dark:border-slate-700 opacity-50';
                    textStyle = 'text-slate-500 dark:text-slate-500';
                  }
                }

                return (
                  <button
                    key={optionKey}
                    onClick={() => handleSelectAnswer(optionKey)}
                    disabled={isAnswered}
                    className={`w-full text-left p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all flex items-start gap-2 sm:gap-3 ${buttonStyle}`}
                  >
                    <span className={`flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold border ${badgeStyle}`}>
                      {optionKey}
                    </span>
                    <span className={`${textStyle} text-sm sm:text-base leading-relaxed pt-0.5`}>
                      {currentQuestion.options[optionKey]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-3 sm:p-4 z-50 transition-colors shadow-lg">
        <div className="max-w-3xl mx-auto flex justify-end">
          {currentIndex === questions.length - 1 ? (
            <button
              onClick={handleFinish}
              disabled={!isAnswered}
              className="bg-green-600 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg font-bold shadow-lg hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base active:scale-95"
            >
              {t('quiz_finish')}
            </button>
          ) : (
            <button
              onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
              className="bg-blue-600 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium shadow-lg hover:bg-blue-700 transition-all flex items-center gap-1.5 text-sm sm:text-base active:scale-95"
            >
              {t('quiz_next')} <ChevronRight size={18} className="sm:w-5 sm:h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};


export default Quiz;