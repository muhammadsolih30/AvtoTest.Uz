import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  getQuestions,
  getQuestionsByCategory,
  saveResult,
} from "../../services/db";
import { Question, TestResult, TestResultDetail } from "../../types";
import { useAuth } from "../../context/AuthContext";
import { useUI } from "../../context/UIContext";
import {
  Clock,
  ChevronRight,
  Timer,
  CheckCircle,
  Flag,
  XCircle,
} from "lucide-react";

const Quiz: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, updateUserProfile } = useAuth();
  const { t } = useUI();

  const count = parseInt(searchParams.get("count") || "20");
  const topic = searchParams.get("topic");

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [totalTime, setTotalTime] = useState(0);
  const [questionTime, setQuestionTime] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const allQuestions = topic ? getQuestionsByCategory(topic) : getQuestions();
    const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count);

    if (selected.length === 0) {
      alert(t("quiz_empty"));
      navigate("/user");
      return;
    }

    setQuestions(selected);
    setLoading(false);
  }, [count, topic, navigate, t]);

  useEffect(() => {
    if (isFinished) return;
    const timer = setInterval(() => setTotalTime((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [isFinished]);

  useEffect(() => {
    setQuestionTime(0);
    if (isFinished) return;
    const qTimer = setInterval(() => setQuestionTime((prev) => prev + 1), 1000);
    return () => clearInterval(qTimer);
  }, [currentIndex, isFinished]);

  const handleFinish = useCallback(() => {
    if (!user || isFinished) return;

    const answeredCount = Object.keys(answers).length;
    if (answeredCount < questions.length) {
      const unanswered = questions.length - answeredCount;
      if (
        !window.confirm(
          `Siz ${unanswered} ta savolga javob bermadingiz. Baribir yakunlashni xohlaysizmi?`,
        )
      ) {
        return;
      }
    }

    setIsFinished(true);

    let correctCount = 0;
    const details: TestResultDetail[] = questions.map((q) => {
      const userAnswer = answers[q.id] || "";
      const isCorrect = userAnswer === q.correctAnswer;
      if (isCorrect) correctCount++;
      return {
        questionId: q.id,
        userAnswer,
        correctAnswer: q.correctAnswer,
        isCorrect,
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
      details,
    };

    saveResult(result);

    const addedPoints = scorePercentage;
    updateUserProfile({
      ...user,
      totalPoints: (user.totalPoints || 0) + addedPoints,
    });

    navigate("/result", { state: { result } });
  }, [
    answers,
    questions,
    totalTime,
    user,
    isFinished,
    navigate,
    updateUserProfile,
  ]);

  const handleSelectAnswer = (optionKey: string) => {
    const currentQ = questions[currentIndex];
    if (answers[currentQ.id]) return;

    setAnswers((prev) => ({ ...prev, [currentQ.id]: optionKey }));
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-lg font-bold text-slate-600 dark:text-slate-400">
            Yuklanmoqda...
          </p>
        </div>
      </div>
    );

  const currentQuestion = questions[currentIndex];
  const userAnswer = answers[currentQuestion.id];
  const isAnswered = !!userAnswer;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 pb-24 overflow-y-auto">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        {/* Header Stats - Sticky */}
        <div className="sticky top-3 sm:top-4 z-50 mb-4">
          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border-2 border-slate-200 dark:border-slate-700 p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              {/* Timers */}
              <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
                <div className="flex items-center gap-2 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/50 dark:to-cyan-900/50 px-3 py-2 rounded-xl border border-blue-200 dark:border-blue-800">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                  <span className="font-black text-blue-700 dark:text-blue-300 font-mono text-xs sm:text-sm">
                    {formatTime(totalTime)}
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/50 dark:to-amber-900/50 px-3 py-2 rounded-xl border border-orange-200 dark:border-orange-800">
                  <Timer className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 dark:text-orange-400" />
                  <span className="font-black text-orange-700 dark:text-orange-300 font-mono text-xs sm:text-sm">
                    {formatTime(questionTime)}
                  </span>
                </div>
              </div>

              {/* Question Counter */}
              <div className="flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 px-4 py-2 rounded-xl border border-purple-200 dark:border-purple-800">
                <span className="text-xs sm:text-sm font-bold text-purple-700 dark:text-purple-300">
                  Savol
                </span>
                <span className="font-black text-base sm:text-lg text-purple-900 dark:text-purple-100">
                  {currentIndex + 1} / {questions.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Circles */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl shadow-xl border-2 border-slate-200 dark:border-slate-700 p-3 sm:p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Flag className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-black text-slate-800 dark:text-white text-xs sm:text-sm">
              Savol holati
            </h3>
          </div>
          <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center">
            {questions.map((q, idx) => {
              const ans = answers[q.id];
              const isCorrect = ans === q.correctAnswer;

              let classes = "w-8 h-8 sm:w-9 sm:h-9";
              let bgClass =
                "bg-slate-100 dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400";

              if (ans) {
                bgClass = isCorrect
                  ? "bg-gradient-to-br from-emerald-500 to-teal-500 border-2 border-emerald-600 text-white shadow-lg"
                  : "bg-gradient-to-br from-red-500 to-rose-500 border-2 border-red-600 text-white shadow-lg";
              } else if (idx === currentIndex) {
                bgClass =
                  "ring-4 ring-blue-500/50 bg-gradient-to-br from-blue-500 to-indigo-500 border-2 border-blue-600 text-white font-black shadow-xl scale-110";
              }

              return (
                <button
                  key={q.id}
                  onClick={() => {
                    if (ans || idx <= currentIndex) setCurrentIndex(idx);
                  }}
                  className={`${classes} ${bgClass} rounded-xl flex items-center justify-center text-[10px] sm:text-xs cursor-pointer transition-all transform hover:scale-110 font-bold ${
                    ans || idx <= currentIndex
                      ? ""
                      : "opacity-40 cursor-not-allowed"
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Question Card - OPTIMIZED FOR FULL VISIBILITY */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl border-2 border-slate-200 dark:border-slate-700 overflow-hidden mb-4">
          {/* Question Image - SMALLER HEIGHT */}
          {currentQuestion.image && (
            <div className="relative h-40 sm:h-48 md:h-52 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center overflow-hidden border-b-2 border-slate-200 dark:border-slate-700">
              <img
                src={currentQuestion.image}
                alt="Question"
                className="max-w-full max-h-full object-contain"
              />
            </div>
          )}

          {/* Question Content */}
          <div className="p-4 sm:p-5 lg:p-6">
            {/* Question Header */}
            <div className="flex items-start gap-2 sm:gap-3 mb-4">
              <div className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center font-black text-white text-sm sm:text-base shadow-lg">
                {currentIndex + 1}
              </div>
              <h2 className="flex-1 text-sm sm:text-base lg:text-lg font-bold text-slate-800 dark:text-white leading-relaxed">
                {currentQuestion.questionText}
              </h2>
            </div>

            {/* Options */}
            <div className="space-y-2 sm:space-y-3">
              {(["A", "B", "C", "D"] as const).map((optionKey) => {
                let buttonClasses =
                  "w-full text-left p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all flex items-start gap-2 sm:gap-3 transform";
                let badgeClasses =
                  "flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex items-center justify-center text-xs sm:text-sm font-black shadow-lg";
                let textClasses =
                  "flex-1 text-xs sm:text-sm lg:text-base leading-relaxed pt-1";

                // Default state
                buttonClasses +=
                  " border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 active:scale-98 hover:shadow-lg";
                badgeClasses +=
                  " bg-slate-100 dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400";
                textClasses +=
                  " text-slate-700 dark:text-slate-200 font-medium";

                if (isAnswered) {
                  if (optionKey === currentQuestion.correctAnswer) {
                    // Correct answer
                    buttonClasses =
                      "w-full text-left p-4 sm:p-5 rounded-xl sm:rounded-2xl border-2 transition-all flex items-start gap-3 border-emerald-500 dark:border-emerald-600 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 shadow-xl";
                    badgeClasses =
                      "flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-sm sm:text-base font-black bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg";
                    textClasses =
                      "flex-1 text-sm sm:text-base lg:text-lg leading-relaxed pt-1 text-emerald-900 dark:text-emerald-100 font-bold";
                  } else if (optionKey === userAnswer) {
                    // Wrong answer
                    buttonClasses =
                      "w-full text-left p-4 sm:p-5 rounded-xl sm:rounded-2xl border-2 transition-all flex items-start gap-3 border-red-500 dark:border-red-600 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/30 dark:to-rose-900/30 shadow-xl";
                    badgeClasses =
                      "flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-sm sm:text-base font-black bg-gradient-to-br from-red-500 to-rose-500 text-white shadow-lg";
                    textClasses =
                      "flex-1 text-sm sm:text-base lg:text-lg leading-relaxed pt-1 text-red-900 dark:text-red-100 font-bold";
                  } else {
                    // Other options
                    buttonClasses =
                      "w-full text-left p-4 sm:p-5 rounded-xl sm:rounded-2xl border-2 transition-all flex items-start gap-3 border-slate-200 dark:border-slate-700 opacity-40";
                    textClasses =
                      "flex-1 text-sm sm:text-base lg:text-lg leading-relaxed pt-1 text-slate-500 dark:text-slate-500";
                  }
                }

                return (
                  <button
                    key={optionKey}
                    onClick={() => handleSelectAnswer(optionKey)}
                    disabled={isAnswered}
                    className={buttonClasses}
                  >
                    <div className={badgeClasses}>{optionKey}</div>
                    <span className={textClasses}>
                      {currentQuestion.options[optionKey]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Footer - Fixed */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-t-2 border-slate-200 dark:border-slate-700 p-4 sm:p-5 z-50 shadow-2xl">
        <div className="max-w-4xl mx-auto flex justify-between items-center gap-3">
          {/* Answered Count */}
          <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/50 dark:to-teal-900/50 px-4 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span className="font-black text-emerald-700 dark:text-emerald-300 text-sm sm:text-base">
              {Object.keys(answers).length}/{questions.length}
            </span>
          </div>

          {/* Navigation Button */}
          {currentIndex === questions.length - 1 ? (
            <button
              onClick={handleFinish}
              className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl font-black shadow-2xl hover:shadow-emerald-500/50 transition-all text-sm sm:text-base transform hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <Flag className="w-4 h-4 sm:w-5 sm:h-5" />
              {t("quiz_finish")}
            </button>
          ) : (
            <button
              onClick={() =>
                setCurrentIndex((prev) =>
                  Math.min(questions.length - 1, prev + 1),
                )
              }
              className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl font-black shadow-2xl hover:shadow-blue-500/50 transition-all text-sm sm:text-base transform hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              {t("quiz_next")}
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Quiz;
