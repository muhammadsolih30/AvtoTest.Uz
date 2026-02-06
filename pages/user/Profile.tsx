import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useUI } from "../../context/UIContext";
import {
  Camera,
  Save,
  ArrowLeft,
  Award,
  TrendingUp,
  User,
  Lock,
  Shield,
  Eye,
  EyeOff,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Profile: React.FC = () => {
  const { user, updateUserProfile } = useAuth();
  const { t } = useUI();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || "");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  if (!user) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMsg("");

    if (!name.trim()) {
      setError("Ism kiritish majburiy");
      return;
    }

    // Agar parol o'zgartirilsa
    if (newPassword || confirmPassword) {
      if (newPassword !== confirmPassword) {
        setError("Parollar mos kelmadi");
        return;
      }

      if (newPassword.length < 4) {
        setError("Parol kamida 4 ta belgidan iborat bo'lishi kerak");
        return;
      }

      // Parol bilan yangilash
      updateUserProfile({
        ...user,
        name,
        password: newPassword,
        avatar,
      });
    } else {
      // Faqat ism va avatar yangilash
      updateUserProfile({
        ...user,
        name,
        avatar,
      });
    }

    setMsg("Profil muvaffaqiyatli yangilandi!");
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => setMsg(""), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 py-6">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-3 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl sm:rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 transition-all transform hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-slate-300" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white">
              {t("prof_title")}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Ma'lumotlaringizni tahrirlang
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Stats Cards */}
          <div className="lg:col-span-1 space-y-4">
            <StatCard
              icon={Award}
              title="Jami Ballar"
              value={user.totalPoints?.toString() || "0"}
              gradient="from-amber-400 to-orange-500"
            />
            <StatCard
              icon={TrendingUp}
              title="Daraja"
              value="Boshlang'ich"
              gradient="from-blue-500 to-cyan-500"
            />
          </div>

          {/* Main Profile Form */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl border-2 border-slate-200 dark:border-slate-700 overflow-hidden">
              {/* Header Gradient */}
              <div className="relative h-32 sm:h-40 bg-gradient-to-br from-purple-600 via-pink-500 to-rose-500 dark:from-purple-800 dark:via-pink-700 dark:to-rose-700">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNLTEwIDMwaDYwdjJoLTYweiIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIuMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNhKSIvPjwvc3ZnPg==')] opacity-50"></div>
              </div>

              <div className="relative px-6 sm:px-8 pb-8">
                {/* Avatar Section */}
                <div className="flex flex-col items-center -mt-16 sm:-mt-20 mb-6">
                  <div className="relative group">
                    {avatar ? (
                      <img
                        src={avatar}
                        alt="Profile"
                        className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl object-cover border-4 border-white dark:border-slate-800 shadow-2xl"
                      />
                    ) : (
                      <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-2xl">
                        <User className="w-14 h-14 sm:w-20 sm:h-20 text-white" />
                      </div>
                    )}
                    <label className="absolute bottom-0 right-0 p-3 bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-xl cursor-pointer hover:from-purple-700 hover:to-pink-700 shadow-2xl transform hover:scale-110 transition-all border-2 border-white dark:border-slate-800">
                      <Camera className="w-5 h-5" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>

                  <div className="text-center mt-4">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white mb-1">
                      {name || "Foydalanuvchi"}
                    </h2>
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 px-4 py-2 rounded-full border border-purple-200 dark:border-purple-700">
                      <Award className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span className="text-sm font-bold text-purple-700 dark:text-purple-300">
                        {user.totalPoints || 0} ball
                      </span>
                    </div>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSave} className="space-y-5">
                  {/* Name Input */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                      <User className="w-4 h-4" />
                      {t("name_label")}
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3.5 border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white rounded-xl sm:rounded-2xl outline-none focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 dark:focus:border-purple-500 font-medium transition-all"
                      placeholder="Ismingizni kiriting"
                    />
                  </div>

                  {/* Password Section */}
                  <div className="space-y-4 p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700/30 dark:to-slate-600/30 rounded-xl border-2 border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                      <Lock className="w-4 h-4" />
                      <span>Parolni o'zgartirish</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                        (ixtiyoriy)
                      </span>
                    </div>

                    {/* New Password */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                        Yangi parol
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-4 py-3 pr-12 border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700/50 text-slate-900 dark:text-white rounded-xl outline-none focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 dark:focus:border-purple-500 font-medium transition-all"
                          placeholder="Yangi parol kiriting"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                          ) : (
                            <Eye className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                        Parolni tasdiqlang
                      </label>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700/50 text-slate-900 dark:text-white rounded-xl outline-none focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 dark:focus:border-purple-500 font-medium transition-all"
                        placeholder="Parolni qayta kiriting"
                      />
                    </div>

                    <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg border border-blue-200 dark:border-blue-800">
                      <Shield className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                      <div>
                        <p className="font-semibold text-blue-700 dark:text-blue-300 mb-1">
                          Parol talablari:
                        </p>
                        <ul className="space-y-0.5 list-disc list-inside">
                          <li>Kamida 4 ta belgi</li>
                          <li>Parollar bir xil bo'lishi kerak</li>
                          <li>
                            Bo'sh qoldirish mumkin (o'zgartirmaslik uchun)
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="p-4 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/30 dark:to-rose-900/30 border-2 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm font-bold rounded-xl flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-lg">!</span>
                      </div>
                      {error}
                    </div>
                  )}

                  {/* Success Message */}
                  {msg && (
                    <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 border-2 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm font-bold rounded-xl flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-lg">✓</span>
                      </div>
                      {msg}
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-700 hover:via-pink-700 hover:to-rose-700 text-white rounded-xl sm:rounded-2xl font-black text-base sm:text-lg shadow-2xl hover:shadow-purple-500/50 transition-all flex items-center justify-center gap-3 transform hover:scale-[1.02] active:scale-95"
                  >
                    <Save className="w-5 h-5" />
                    {t("prof_save")}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
interface StatCardProps {
  icon: React.ElementType;
  title: string;
  value: string;
  gradient: string;
}

const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  title,
  value,
  gradient,
}) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl shadow-xl border-2 border-slate-200 dark:border-slate-700 p-5 sm:p-6 hover:shadow-2xl transition-all transform hover:scale-105">
      <div
        className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${gradient} rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 shadow-lg`}
      >
        <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
      </div>
      <p className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">
        {title}
      </p>
      <p className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white">
        {value}
      </p>
    </div>
  );
};

export default Profile;
