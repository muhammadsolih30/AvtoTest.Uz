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
  Calendar,
  Clock,
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
    const cardNumber = "8600 1234 5678 9012";
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

  const xpProgress = progress
    ? (progress.xp / progress.xpForNextLevel) * 100
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6">
        {/* Welcome Banner - Gradient Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 dark:from-blue-800 dark:via-indigo-800 dark:to-purple-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white shadow-2xl">
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
                  Xush kelibsiz! 👋
                </h1>
                <p className="text-lg sm:text-xl font-bold text-blue-50">
                  {user?.name}
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {new Date().toLocaleDateString("uz-UZ")}
                </span>
              </div>
            </div>

            <p className="text-blue-50 text-sm sm:text-base mb-6 max-w-2xl">
              Bugun ham yangi bilimlar orttiring va maqsadlaringizga
              yaqinlashing!
            </p>

            {/* Level & XP Card */}
            <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                {/* Level Badge */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <Star className="w-8 h-8 sm:w-10 sm:h-10 text-white fill-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 bg-white text-blue-600 text-xs font-black px-2 py-0.5 rounded-full shadow-md">
                      LVL
                    </div>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-blue-100 font-medium mb-1">
                      Sizning darajangiz
                    </p>
                    <p className="text-3xl sm:text-4xl font-black text-white">
                      {progress?.level || 1}
                    </p>
                  </div>
                </div>

                {/* XP Progress */}
                <div className="flex-1 w-full">
                  <div className="flex justify-between items-center text-sm text-blue-50 mb-2">
                    <span className="font-semibold">Tajriba ballari (XP)</span>
                    <span className="font-black">
                      {progress?.xp || 0} / {progress?.xpForNextLevel || 100}
                    </span>
                  </div>
                  <div className="relative w-full h-4 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 transition-all duration-700 ease-out shadow-lg"
                      style={{ width: `${xpProgress}%` }}
                    >
                      <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                    </div>
                  </div>
                  <p className="text-xs text-blue-100 mt-2 font-medium">
                    Keyingi darajagacha:{" "}
                    {progress?.xpForNextLevel - progress?.xp || 100} XP
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Start Test Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 dark:from-emerald-700 dark:to-teal-800 p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 sm:w-7 sm:h-7 text-white fill-white" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Tezkor Test
                </h2>
                <p className="text-emerald-50 text-sm">
                  Bilimlaringizni sinab ko'ring
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                Savollar soni:{" "}
                <span className="text-emerald-600 dark:text-emerald-400 text-lg">
                  {questionCount}
                </span>
              </label>
              <div className="flex gap-2 flex-wrap">
                {[10, 20, 30, 40].map((num) => (
                  <button
                    key={num}
                    onClick={() => setQuestionCount(num)}
                    className={`flex-1 min-w-[60px] py-2.5 px-4 rounded-xl font-bold text-sm transition-all ${
                      questionCount === num
                        ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg scale-105"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={startTest}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white rounded-xl sm:rounded-2xl font-black text-base sm:text-lg shadow-2xl hover:shadow-emerald-500/50 transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
            >
              <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-white" />
              Testni Boshlash
            </button>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <ActionCard
            onClick={() => navigate("/topics")}
            icon={BookOpen}
            title="Mavzular"
            description="Bo'limlar bo'yicha"
            color="blue"
          />
          <ActionCard
            onClick={() => navigate("/badges")}
            icon={Award}
            title="Nishonlar"
            description={`${progress?.badges?.length || 0} ta olindi`}
            color="yellow"
          />
          <ActionCard
            onClick={() => navigate("/friends")}
            icon={Users}
            title="Do'stlar"
            description="Raqobatlashish"
            color="purple"
          />
          <ActionCard
            onClick={() => navigate("/goals")}
            icon={Target}
            title="Maqsadlar"
            description="Rejalaringiz"
            color="green"
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Statistics Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-black text-slate-800 dark:text-white">
                Statistika
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 p-4 rounded-xl border border-blue-100 dark:border-blue-900">
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-2">
                  Jami Testlar
                </p>
                <p className="text-3xl font-black text-blue-700 dark:text-blue-300">
                  {history.length}
                </p>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900">
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-2">
                  O'rtacha Ball
                </p>
                <p
                  className={`text-3xl font-black ${
                    averageScore >= 80
                      ? "text-emerald-600 dark:text-emerald-400"
                      : averageScore >= 60
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {averageScore}%
                </p>
              </div>
            </div>

            {lastResult && (
              <div className="mt-6 p-4 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/50 dark:to-purple-950/50 rounded-xl border border-violet-200 dark:border-violet-800">
                <p className="text-sm font-bold text-violet-700 dark:text-violet-300 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Oxirgi Urinish
                </p>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-3xl font-black text-slate-800 dark:text-white mb-1">
                      {lastResult.scorePercentage}%
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {new Date(lastResult.date).toLocaleDateString("uz-UZ")}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate("/history")}
                    className="text-sm font-bold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 underline"
                  >
                    Batafsil
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Additional Options */}
          <div className="space-y-3">
            <button
              onClick={() => navigate("/history")}
              className="w-full py-4 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl sm:rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-blue-400 dark:hover:border-blue-600 transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl group"
            >
              <History className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Test Tarixi</span>
            </button>

            <button
              onClick={() => navigate("/leaderboard")}
              className="w-full py-4 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl sm:rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-amber-400 dark:hover:border-amber-600 transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl group"
            >
              <TrendingUp className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Reyting Jadvali</span>
            </button>

            <button
              onClick={() => navigate("/study-materials")}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl sm:rounded-2xl font-black shadow-2xl hover:shadow-purple-500/50 transition-all flex items-center justify-center gap-3 transform hover:scale-[1.02] active:scale-95"
            >
              <BookOpen className="w-5 h-5" />
              <span>O'quv Materiallari</span>
            </button>
          </div>
        </div>

        {/* Donation Section - Premium Design */}
        <div className="relative overflow-hidden bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-600 dark:from-rose-700 dark:via-pink-700 dark:to-fuchsia-800 rounded-2xl sm:rounded-3xl shadow-2xl">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNLTEwIDMwaDYwdjJoLTYweiIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIuMDUiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=')] opacity-50"></div>

          <div className="relative z-10 p-6 sm:p-8">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-xl">
                  <Heart className="w-7 h-7 sm:w-8 sm:h-8 text-white fill-white animate-pulse" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white mb-1">
                    Qo'llab-quvvatlang
                  </h2>
                  <p className="text-sm text-rose-50 font-medium">
                    Ixtiyoriy xayriya
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDonation(!showDonation)}
                className="p-3 bg-white/20 backdrop-blur-md hover:bg-white/30 rounded-xl transition-all border border-white/30"
              >
                <CreditCard className="w-5 h-5 text-white" />
              </button>
            </div>

            <p className="text-sm sm:text-base text-white leading-relaxed mb-6 bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
              Agar saytimizdan foydalanib{" "}
              <span className="font-black">haydovchilik guvohnomasini</span>{" "}
              olishga muvaffaq bo'lsangiz, bizni{" "}
              <span className="font-black">kichik danat</span> bilan
              qo'llab-quvvatlashingiz mumkin.
            </p>

            {showDonation && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border-2 border-white/30 animate-fadeIn shadow-2xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Karta raqami
                  </span>
                  <span className="text-xs bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 px-3 py-1 rounded-full font-bold">
                    Uzcard
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-600 p-4 rounded-xl font-mono text-lg font-black text-slate-800 dark:text-white tracking-wider border-2 border-slate-200 dark:border-slate-500">
                    8600 1234 5678 9012
                  </div>
                  <button
                    onClick={copyCardNumber}
                    className={`p-4 rounded-xl transition-all shadow-lg ${
                      copied
                        ? "bg-gradient-to-br from-emerald-500 to-teal-500 text-white scale-110"
                        : "bg-gradient-to-br from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white"
                    }`}
                  >
                    {copied ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-3 font-medium">
                  {copied ? "Nusxalandi! ✓" : "Nusxalash uchun tugmani bosing"}
                </p>
              </div>
            )}

            <div className="flex items-start gap-3 text-sm text-white mt-6 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <span className="text-xl">💝</span>
              <p className="font-medium leading-relaxed">
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

// Action Card Component
interface ActionCardProps {
  onClick: () => void;
  icon: React.ElementType;
  title: string;
  description: string;
  color: "blue" | "yellow" | "purple" | "green";
}

const ActionCard: React.FC<ActionCardProps> = ({
  onClick,
  icon: Icon,
  title,
  description,
  color,
}) => {
  const colorClasses = {
    blue: "from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 border-blue-200 dark:border-blue-800",
    yellow:
      "from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 border-amber-200 dark:border-amber-800",
    purple:
      "from-purple-500 to-fuchsia-500 hover:from-purple-600 hover:to-fuchsia-600 border-purple-200 dark:border-purple-800",
    green:
      "from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 border-emerald-200 dark:border-emerald-800",
  };

  return (
    <button
      onClick={onClick}
      className="group bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-5 border-2 border-slate-200 dark:border-slate-700 hover:border-transparent transition-all shadow-lg hover:shadow-2xl transform hover:scale-105 active:scale-95"
    >
      <div
        className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${colorClasses[color]} rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg`}
      >
        <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
      </div>
      <h3 className="font-black text-slate-800 dark:text-white text-sm sm:text-base mb-1">
        {title}
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
        {description}
      </p>
    </button>
  );
};

export default UserDashboard;
