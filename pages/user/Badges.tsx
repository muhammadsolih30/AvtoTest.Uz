import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getUserProgress, checkAndAwardBadges } from "../../services/db";
import { useNavigate } from "react-router-dom";
import {
  Award,
  Trophy,
  Target,
  Zap,
  Star,
  Clock,
  Moon,
  Sun as SunIcon,
  ArrowLeft,
} from "lucide-react";

interface BadgeInfo {
  id: string;
  name: string;
  description: string;
  icon: JSX.Element;
  color: string;
}

const BADGES: BadgeInfo[] = [
  {
    id: "FIRST_TEST",
    name: "Birinchi Qadam",
    description: "Birinchi testni tugatdingiz!",
    icon: <Star className="w-6 h-6" />,
    color: "from-blue-500 to-blue-600",
  },
  {
    id: "SCORE_100",
    name: "Mukammal Ball",
    description: "100% natija qo'ldingiz!",
    icon: <Trophy className="w-6 h-6" />,
    color: "from-yellow-500 to-yellow-600",
  },
  {
    id: "TESTS_10",
    name: "10 Test",
    description: "10 ta test topshirdingiz",
    icon: <Target className="w-6 h-6" />,
    color: "from-green-500 to-green-600",
  },
  {
    id: "TESTS_50",
    name: "50 Test",
    description: "50 ta test topshirdingiz",
    icon: <Target className="w-6 h-6" />,
    color: "from-purple-500 to-purple-600",
  },
  {
    id: "TESTS_100",
    name: "100 Test",
    description: "100 ta test topshirdingiz!",
    icon: <Award className="w-6 h-6" />,
    color: "from-red-500 to-red-600",
  },
  {
    id: "SPEED_MASTER",
    name: "Tezkor Usta",
    description: "Testni tez va to'g'ri bajardingiz",
    icon: <Zap className="w-6 h-6" />,
    color: "from-orange-500 to-orange-600",
  },
  {
    id: "EARLY_BIRD",
    name: "Erta Qush",
    description: "Ertalab test topshirdingiz",
    icon: <SunIcon className="w-6 h-6" />,
    color: "from-amber-500 to-amber-600",
  },
  {
    id: "NIGHT_OWL",
    name: "Tungi Qush",
    description: "Tunda test topshirdingiz",
    icon: <Moon className="w-6 h-6" />,
    color: "from-indigo-500 to-indigo-600",
  },
];

const Badges: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [progress, setProgress] = useState<any>(null);

  useEffect(() => {
    if (user) {
      checkAndAwardBadges(user.id);
      setProgress(getUserProgress(user.id));
    }
  }, [user]);

  const earnedBadges = BADGES.filter((badge) =>
    progress?.badges?.includes(badge.id),
  );

  const lockedBadges = BADGES.filter(
    (badge) => !progress?.badges?.includes(badge.id),
  );

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-900 dark:to-indigo-900 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => navigate('/user')}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Orqaga qaytish"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Award className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Yutuqlar va Nishonlar</h1>
        </div>
        <p className="text-blue-100">
          Topshirgan testlaringiz uchun maxsus nishonlar yig'ing!
        </p>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <p className="text-sm text-blue-100">Olgan nishonlar</p>
            <p className="text-2xl font-bold">
              {earnedBadges.length}/{BADGES.length}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <p className="text-sm text-blue-100">Daraja</p>
            <p className="text-2xl font-bold">Level {progress?.level || 1}</p>
          </div>
        </div>
      </div>

      {/* Earned Badges */}
      {earnedBadges.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
            🏆 Olingan Nishonlar
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {earnedBadges.map((badge) => (
              <div
                key={badge.id}
                className="bg-white dark:bg-slate-800 rounded-xl p-4 border-2 border-slate-200 dark:border-slate-700 hover:scale-105 transition-transform"
              >
                <div
                  className={`w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br ${badge.color} flex items-center justify-center text-white shadow-lg`}
                >
                  {badge.icon}
                </div>
                <h3 className="text-center font-bold text-slate-800 dark:text-white mb-1">
                  {badge.name}
                </h3>
                <p className="text-xs text-center text-slate-500 dark:text-slate-400">
                  {badge.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Locked Badges */}
      {lockedBadges.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
            🔒 Qulfli Nishonlar
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {lockedBadges.map((badge) => (
              <div
                key={badge.id}
                className="bg-white dark:bg-slate-800 rounded-xl p-4 border-2 border-dashed border-slate-300 dark:border-slate-600 opacity-60"
              >
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500">
                  {badge.icon}
                </div>
                <h3 className="text-center font-bold text-slate-600 dark:text-slate-400 mb-1">
                  {badge.name}
                </h3>
                <p className="text-xs text-center text-slate-500 dark:text-slate-400">
                  {badge.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Badges;