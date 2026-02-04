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
  Heart,
  CreditCard,
  Copy,
  Check,
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
  const [showDonation, setShowDonation] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const copyCardNumber = () => {
    const cardNumber = "8600 1234 5678 9012"; // Random karta raqami
    navigator.clipboard.writeText(cardNumber.replace(/\s/g, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-900 dark:to-indigo-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-lg">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2">
            Xush kelibsiz, {user?.name}! 👋
          </h1>
          <p className="text-blue-100 text-sm sm:text-base mb-3 sm:mb-4">
            Bugun ham yangi bilimlar orttiring va maqsadlaringizga yaqinlashing!
          </p>

          {/* Level & XP */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <Star className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 flex-shrink-0" />
              <div>
                <p className="text-xs sm:text-sm text-blue-100">Daraja</p>
                <p className="text-xl sm:text-2xl font-bold">
                  {progress?.level || 1}
                </p>
              </div>
            </div>

            <div className="flex-1 w-full sm:w-auto">
              <div className="flex justify-between text-xs sm:text-sm text-blue-100 mb-1">
                <span>XP</span>
                <span>
                  {progress?.xp || 0} / {progress?.xpForNextLevel || 100}
                </span>
              </div>
              <div className="w-full h-2.5 sm:h-3 bg-blue-700/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 transition-all duration-500"
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          <button
            onClick={() => navigate("/topics")}
            className="bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all group shadow-sm active:scale-95"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white text-xs sm:text-sm">
              Mavzular
            </h3>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
              Bo'limlar bo'yicha
            </p>
          </button>

          <button
            onClick={() => navigate("/badges")}
            className="bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-slate-200 dark:border-slate-700 hover:border-yellow-500 dark:hover:border-yellow-500 transition-all group shadow-sm active:scale-95"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-transform">
              <Award className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white text-xs sm:text-sm">
              Nishonlar
            </h3>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
              {progress?.badges?.length || 0} ta olindi
            </p>
          </button>

          <button
            onClick={() => navigate("/friends")}
            className="bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-slate-200 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-500 transition-all group shadow-sm active:scale-95"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white text-xs sm:text-sm">
              Do'stlar
            </h3>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
              Raqobatlashish
            </p>
          </button>

          <button
            onClick={() => navigate("/goals")}
            className="bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-slate-200 dark:border-slate-700 hover:border-green-500 dark:hover:border-green-500 transition-all group shadow-sm active:scale-95"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-900/30 rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-transform">
              <Target className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white text-xs sm:text-sm">
              Maqsadlar
            </h3>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
              Kuzatib boring
            </p>
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Start Test Card */}
          <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 sm:p-6 transition-colors">
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
              <Play className="text-blue-600 dark:text-blue-400 w-5 h-5 sm:w-6 sm:h-6" />
              {t("dash_start")}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-4 sm:mb-6">
              {t("dash_start_desc")}
            </p>

            {/* Test Modes */}
            <div className="mb-4 sm:mb-6 space-y-2 sm:space-y-3">
              <button
                onClick={() => navigate("/quiz?mode=quick")}
                className="w-full p-3 sm:p-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg sm:rounded-xl font-medium hover:from-orange-600 hover:to-red-600 transition-all flex items-center justify-between group active:scale-98"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <div className="text-left">
                    <p className="font-bold text-sm sm:text-base">
                      Tezkor Test
                    </p>
                    <p className="text-[10px] sm:text-xs text-orange-100">
                      10 ta savol, 5 daqiqa
                    </p>
                  </div>
                </div>
                <span className="text-xl sm:text-2xl group-hover:scale-125 transition-transform">
                  ⚡
                </span>
              </button>

              <button
                onClick={() => navigate("/quiz?mode=exam")}
                className="w-full p-3 sm:p-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg sm:rounded-xl font-medium hover:from-red-600 hover:to-pink-600 transition-all flex items-center justify-between group active:scale-98"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <div className="text-left">
                    <p className="font-bold text-sm sm:text-base">
                      Imtihon Simulyatori
                    </p>
                    <p className="text-[10px] sm:text-xs text-red-100">
                      Real imtihon sharoitida
                    </p>
                  </div>
                </div>
                <span className="text-xl sm:text-2xl group-hover:scale-125 transition-transform">
                  🎯
                </span>
              </button>
            </div>

            <div className="mb-4 sm:mb-6">
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
          <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 sm:p-6 transition-colors">
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
              <Trophy className="text-yellow-500 w-5 h-5 sm:w-6 sm:h-6" />
              {t("dash_stats")}
            </h2>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-slate-50 dark:bg-slate-700 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-1">
                  {t("dash_total_tests")}
                </p>
                <p className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">
                  {history.length}
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-1">
                  {t("dash_avg_score")}
                </p>
                <p
                  className={`text-xl sm:text-2xl font-bold ${averageScore >= 80 ? "text-green-600 dark:text-green-400" : averageScore >= 60 ? "text-yellow-600 dark:text-yellow-400" : "text-red-600 dark:text-red-400"}`}
                >
                  {averageScore}%
                </p>
              </div>
            </div>

            {lastResult && (
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg sm:rounded-xl border border-blue-100 dark:border-blue-800">
                <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-medium mb-2">
                  {t("dash_last_attempt")}
                </p>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">
                      {lastResult.scorePercentage}%
                    </p>
                    <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
                      {new Date(lastResult.date).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate("/history")}
                    className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {t("dash_view_history")}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Additional Options */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <button
              onClick={() => navigate("/history")}
              className="py-2.5 sm:py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg sm:rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 active:scale-95"
            >
              <History size={18} className="sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Tarix</span>
            </button>

            <button
              onClick={() => navigate("/leaderboard")}
              className="py-2.5 sm:py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg sm:rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 active:scale-95"
            >
              <TrendingUp size={18} className="sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Reyting</span>
            </button>
          </div>

          <button
            onClick={() => navigate("/study-materials")}
            className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg sm:rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2 active:scale-98"
          >
            <BookOpen size={18} className="sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">O'quv Materiallari</span>
          </button>
        </div>

        {/* Donation Section */}
        <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/10 dark:to-purple-900/10 rounded-xl sm:rounded-2xl shadow-sm border-2 border-pink-200 dark:border-pink-800 overflow-hidden transition-all">
          <div className="p-4 sm:p-6">
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white">
                    Loyihamizni Qo'llab-quvvatlang
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    Ixtiyoriy danat
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDonation(!showDonation)}
                className="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 transition-colors"
              >
                <CreditCard size={20} />
              </button>
            </div>

            <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 mb-3 sm:mb-4 leading-relaxed">
              Agar saytimizdan foydalanib{" "}
              <span className="font-semibold text-pink-600 dark:text-pink-400">
                haydovchilik guvohnomasini
              </span>{" "}
              olishga muvaffaq bo'lsangiz, biz uchun kichik bir{" "}
              <span className="font-semibold">danat qilishingiz mumkin</span>.
              Bu <span className="italic">ixtiyoriy</span> bo'lib, loyihamizni
              rivojlantirishga yordam beradi.
            </p>

            {showDonation && (
              <div className="bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-pink-200 dark:border-pink-700 animate-fadeIn">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
                    Karta raqami
                  </span>
                  <span className="text-[10px] sm:text-xs bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 px-2 py-0.5 rounded-full">
                    Uzcard
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1 bg-slate-50 dark:bg-slate-700 p-2.5 sm:p-3 rounded-lg font-mono text-sm sm:text-base font-bold text-slate-800 dark:text-white tracking-wider">
                    8600 1234 5678 9012
                  </div>
                  <button
                    onClick={copyCardNumber}
                    className={`p-2.5 sm:p-3 rounded-lg transition-all ${
                      copied
                        ? "bg-green-500 text-white"
                        : "bg-pink-500 hover:bg-pink-600 text-white"
                    }`}
                  >
                    {copied ? (
                      <Check size={18} className="sm:w-5 sm:h-5" />
                    ) : (
                      <Copy size={18} className="sm:w-5 sm:h-5" />
                    )}
                  </button>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 text-center italic">
                  Karta raqamini nusxalash uchun tugmani bosing
                </p>
              </div>
            )}

            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-3 sm:mt-4 p-2 sm:p-3 bg-pink-100/50 dark:bg-pink-900/20 rounded-lg">
              <span className="text-base sm:text-lg"></span>
              <p>
                Sizning qo'llab-quvvatlashingiz bizni yanada yaxshi xizmat
                ko'rsatishga undaydi!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
