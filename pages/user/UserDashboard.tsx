import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Play,
  History,
  Trophy,
  Target,
  Users,
  BookOpen,
  Award,
  TrendingUp,
  Zap,
  Star,
  AlertCircle,
} from "lucide-react";
import {
  getResults,
  getUserProgress,
  checkAndAwardBadges,
} from "../../services/db";
import { useAuth } from "../../context/AuthContext";
import { useUI } from "../../context/UIContext";
import { TestResult } from "../../types";

const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useUI();
  const [history, setHistory] = useState<TestResult[]>([]);
  const [progress, setProgress] = useState<any>(null);
  const [questionCount, setQuestionCount] = useState(20);

  useEffect(() => {
    if (user) {
      setHistory(getResults(user.id));
      checkAndAwardBadges(user.id);
      setProgress(getUserProgress(user.id));
    }
  }, [user]);

  const startTest = () => {
    navigate(`/quiz?count=${questionCount}`);
  };

  const lastResult = history.length > 0 ? history[0] : null;
  const averageScore =
    history.length > 0
      ? Math.round(
          history.reduce((acc, curr) => acc + curr.scorePercentage, 0) /
            history.length,
        )
      : 0;

  // Calculate XP progress percentage
  const xpProgress = progress
    ? (progress.xp / progress.xpForNextLevel) * 100
    : 0;

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-900 dark:to-indigo-900 rounded-2xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Xush kelibsiz, {user?.name}! 👋
        </h1>
        <p className="text-blue-100 mb-4">
          Bugun ham yangi bilimlar orttiring va maqsadlaringizga yaqinlashing!
        </p>

        {/* Level & XP */}
        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <div className="flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-400" />
            <div>
              <p className="text-sm text-blue-100">Daraja</p>
              <p className="text-2xl font-bold">{progress?.level || 1}</p>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex justify-between text-sm text-blue-100 mb-1">
              <span>XP</span>
              <span>
                {progress?.xp || 0} / {progress?.xpForNextLevel || 100}
              </span>
            </div>
            <div className="w-full h-3 bg-blue-700/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 transition-all"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => navigate("/topics")}
          className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all group"
        >
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="font-bold text-slate-800 dark:text-white text-sm">
            Mavzular
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Bo'limlar bo'yicha
          </p>
        </button>

        <button
          onClick={() => navigate("/badges")}
          className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:border-yellow-500 dark:hover:border-yellow-500 transition-all group"
        >
          <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Award className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <h3 className="font-bold text-slate-800 dark:text-white text-sm">
            Nishonlar
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {progress?.badges?.length || 0} ta olindi
          </p>
        </button>

        <button
          onClick={() => navigate("/friends")}
          className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-500 transition-all group"
        >
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="font-bold text-slate-800 dark:text-white text-sm">
            Do'stlar
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Raqobatlashish
          </p>
        </button>

        <button
          onClick={() => navigate("/goals")}
          className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:border-green-500 dark:hover:border-green-500 transition-all group"
        >
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="font-bold text-slate-800 dark:text-white text-sm">
            Maqsadlar
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Kuzatib boring
          </p>
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Start Test Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 transition-colors">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Play className="text-blue-600 dark:text-blue-400" />
            {t("dash_start")}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            {t("dash_start_desc")}
          </p>

          {/* Test Modes */}
          <div className="mb-6 space-y-3">
            <button
              onClick={() => navigate("/quiz?mode=quick")}
              className="w-full p-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium hover:from-orange-600 hover:to-red-600 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5" />
                <div className="text-left">
                  <p className="font-bold">Tezkor Test</p>
                  <p className="text-xs text-orange-100">
                    10 ta savol, 5 daqiqa
                  </p>
                </div>
              </div>
              <span className="text-2xl group-hover:scale-125 transition-transform">
                ⚡
              </span>
            </button>

            <button
              onClick={() => navigate("/quiz?mode=exam")}
              className="w-full p-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-medium hover:from-red-600 hover:to-pink-600 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5" />
                <div className="text-left">
                  <p className="font-bold">Imtihon Simulyatori</p>
                  <p className="text-xs text-red-100">
                    Real imtihon sharoitida
                  </p>
                </div>
              </div>
              <span className="text-2xl group-hover:scale-125 transition-transform">
                🎯
              </span>
            </button>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t("dash_select_count")}{" "}
              <span className="text-blue-600 dark:text-blue-400 font-bold">
                {questionCount}
              </span>
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((num) => (
                <button
                  key={num}
                  onClick={() => setQuestionCount(num)}
                  className={`py-2 rounded-lg text-sm font-medium transition-all ${
                    questionCount === num
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
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
            {t("dash_start_btn")}
          </button>
        </div>

        {/* Stats Card */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 transition-colors">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Trophy className="text-yellow-500" />
              {t("dash_stats")}
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-xl">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                  {t("dash_total_tests")}
                </p>
                <p className="text-2xl font-bold text-slate-800 dark:text-white">
                  {history.length}
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-xl">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                  {t("dash_avg_score")}
                </p>
                <p
                  className={`text-2xl font-bold ${averageScore >= 80 ? "text-green-600 dark:text-green-400" : averageScore >= 60 ? "text-yellow-600 dark:text-yellow-400" : "text-red-600 dark:text-red-400"}`}
                >
                  {averageScore}%
                </p>
              </div>
            </div>

            {lastResult && (
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-2">
                  {t("dash_last_attempt")}
                </p>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white">
                      {lastResult.scorePercentage}%
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(lastResult.date).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate("/history")}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {t("dash_view_history")}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Additional Options */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate("/history")}
              className="py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
            >
              <History size={20} />
              Tarix
            </button>

            <button
              onClick={() => navigate("/leaderboard")}
              className="py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
            >
              <TrendingUp size={20} />
              Reyting
            </button>
          </div>

          <button
            onClick={() => navigate("/study-materials")}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
          >
            <BookOpen size={20} />
            O'quv Materiallari
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
