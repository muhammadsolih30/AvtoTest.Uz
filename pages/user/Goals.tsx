import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  getUserGoals,
  updateUserGoals,
  getResults,
  getUserProgress,
} from "../../services/db";
import { Target, TrendingUp, Calendar, CheckCircle } from "lucide-react";

const Goals: React.FC = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);
  const [progress, setProgress] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    dailyTestTarget: 3,
    accuracyTarget: 80,
    weeklyTestTarget: 20,
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = () => {
    if (!user) return;

    const userGoals = getUserGoals(user.id);
    const userResults = getResults(user.id);
    const userProgress = getUserProgress(user.id);

    setGoals(userGoals);
    setResults(userResults);
    setProgress(userProgress);
    setFormData({
      dailyTestTarget: userGoals.dailyTestTarget,
      accuracyTarget: userGoals.accuracyTarget,
      weeklyTestTarget: userGoals.weeklyTestTarget,
    });
  };

  const handleSave = () => {
    if (!user) return;

    updateUserGoals(user.id, formData);
    loadData();
    setEditing(false);
  };

  // Calculate today's tests
  const today = new Date().toDateString();
  const todayTests = results.filter(
    (r) => new Date(r.date).toDateString() === today,
  );
  const dailyProgress = Math.min(
    (todayTests.length / goals?.dailyTestTarget || 1) * 100,
    100,
  );

  // Calculate this week's tests
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const weekTests = results.filter((r) => new Date(r.date) >= weekStart);
  const weeklyProgress = Math.min(
    (weekTests.length / goals?.weeklyTestTarget || 1) * 100,
    100,
  );

  // Calculate accuracy
  const recentTests = results.slice(0, 10);
  const avgAccuracy =
    recentTests.length > 0
      ? recentTests.reduce((acc, r) => acc + r.scorePercentage, 0) /
        recentTests.length
      : 0;
  const accuracyProgress = Math.min(
    (avgAccuracy / goals?.accuracyTarget || 1) * 100,
    100,
  );

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 dark:from-green-900 dark:to-teal-900 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Target className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Maqsadlar</h1>
          </div>
          <button
            onClick={() => setEditing(!editing)}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          >
            {editing ? "Bekor qilish" : "Tahrirlash"}
          </button>
        </div>
        <p className="text-green-100">
          O'zingizga maqsadlar qo'ying va ularni kuzatib boring
        </p>
      </div>

      {/* Goals Settings */}
      {editing ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">
            Maqsadlarni sozlash
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Kunlik test maqsadi
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={formData.dailyTestTarget}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dailyTestTarget: parseInt(e.target.value),
                  })
                }
                className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Har kuni nechta test topshirmoqchisiz?
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Haftalik test maqsadi
              </label>
              <input
                type="number"
                min="1"
                max="200"
                value={formData.weeklyTestTarget}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    weeklyTestTarget: parseInt(e.target.value),
                  })
                }
                className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Har hafta nechta test topshirmoqchisiz?
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                To'g'ri javoblar maqsadi (%)
              </label>
              <input
                type="number"
                min="50"
                max="100"
                value={formData.accuracyTarget}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    accuracyTarget: parseInt(e.target.value),
                  })
                }
                className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Qanday natija qo'lishni maqsad qilgansiz?
              </p>
            </div>

            <button
              onClick={handleSave}
              className="w-full py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-teal-700 transition-all"
            >
              Saqlash
            </button>
          </div>
        </div>
      ) : (
        // Progress Display
        <div className="grid md:grid-cols-3 gap-6">
          {/* Daily Goal */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white">
                  Kunlik Maqsad
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {todayTests.length}/{goals?.dailyTestTarget} test
                </p>
              </div>
            </div>

            <div className="relative w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
                style={{ width: `${dailyProgress}%` }}
              />
            </div>
            <p className="text-xs text-right text-slate-500 dark:text-slate-400">
              {dailyProgress.toFixed(0)}%
            </p>

            {todayTests.length >= (goals?.dailyTestTarget || 0) && (
              <div className="mt-4 flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">
                  Maqsad bajarildi! 🎉
                </span>
              </div>
            )}
          </div>

          {/* Weekly Goal */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white">
                  Haftalik Maqsad
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {weekTests.length}/{goals?.weeklyTestTarget} test
                </p>
              </div>
            </div>

            <div className="relative w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all"
                style={{ width: `${weeklyProgress}%` }}
              />
            </div>
            <p className="text-xs text-right text-slate-500 dark:text-slate-400">
              {weeklyProgress.toFixed(0)}%
            </p>

            {weekTests.length >= (goals?.weeklyTestTarget || 0) && (
              <div className="mt-4 flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">
                  Maqsad bajarildi! 🎉
                </span>
              </div>
            )}
          </div>

          {/* Accuracy Goal */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white">
                  Aniqlik Maqsadi
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {avgAccuracy.toFixed(0)}%/{goals?.accuracyTarget}%
                </p>
              </div>
            </div>

            <div className="relative w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-green-600 transition-all"
                style={{ width: `${accuracyProgress}%` }}
              />
            </div>
            <p className="text-xs text-right text-slate-500 dark:text-slate-400">
              {accuracyProgress.toFixed(0)}%
            </p>

            {avgAccuracy >= (goals?.accuracyTarget || 0) && (
              <div className="mt-4 flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">
                  Maqsad bajarildi! 🎉
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
          Umumiy Statistika
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <p className="text-2xl font-bold text-slate-800 dark:text-white">
              {results.length}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Jami testlar
            </p>
          </div>

          <div className="text-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <p className="text-2xl font-bold text-slate-800 dark:text-white">
              {progress?.level || 1}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Daraja</p>
          </div>

          <div className="text-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <p className="text-2xl font-bold text-slate-800 dark:text-white">
              {progress?.badges?.length || 0}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Nishonlar
            </p>
          </div>

          <div className="text-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <p className="text-2xl font-bold text-slate-800 dark:text-white">
              {progress?.streak || 0}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Kun ketma-ket
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Goals;
