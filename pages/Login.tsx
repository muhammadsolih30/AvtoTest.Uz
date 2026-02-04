import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useUI } from "../context/UIContext";
import { loginUser, registerUser, getUsers } from "../services/db";
import { Role } from "../types";
import {
  ArrowLeft,
  UserPlus,
  LogIn,
  Moon,
  Sun,
  Car,
  Shield,
  Users,
  Award,
} from "lucide-react";
import { languages } from "../services/translations";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t, toggleTheme, theme, language, setLanguage } = useUI();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showLang, setShowLang] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError(t("error_fill_all"));
      return;
    }

    try {
      // Admin ekanligini tekshirish
      if (
        username === "muhammadsolihabduvosiyev" &&
        password === "muhammadsolihadmin12345"
      ) {
        // Admin login
        const users = getUsers();
        let adminUser = users.find((u) => u.role === Role.ADMIN);

        if (!adminUser) {
          // Agar admin yo'q bo'lsa, yaratamiz
          adminUser = {
            id: "admin-" + Date.now(),
            name: "Admin",
            role: Role.ADMIN,
            password: "muhammadsolihadmin12345",
          };
        }

        login(adminUser);
        navigate("/admin");
        return;
      }

      // Oddiy user login/register
      if (mode === "register" && password.length < 4) {
        setError(t("error_pass_len"));
        return;
      }

      let user;
      if (mode === "register") {
        user = registerUser(username, password);
      } else {
        user = loginUser(username, password);
      }

      login(user);
      navigate("/user");
    } catch (err: any) {
      if (err.message.includes("mavjud")) setError(t("error_user_exists"));
      else if (err.message.includes("topilmadi"))
        setError(t("error_user_not_found"));
      else if (err.message.includes("noto'g'ri")) setError(t("error_pass"));
      else setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex transition-colors">
      {/* Top Controls */}
      <div className="fixed top-4 right-4 flex gap-2 z-50">
        <button
          onClick={toggleTheme}
          className="p-2.5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-slate-600 dark:text-slate-300 rounded-full shadow-lg hover:shadow-xl transition-all"
        >
          {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
        </button>
        <div className="relative">
          <button
            onClick={() => setShowLang(!showLang)}
            className="p-2.5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-slate-600 dark:text-slate-300 rounded-full shadow-lg hover:shadow-xl transition-all uppercase text-xs font-bold w-10 h-10 flex items-center justify-center"
          >
            {language}
          </button>
          {showLang && (
            <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-700 z-20 py-2 overflow-hidden">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    setLanguage(l.code);
                    setShowLang(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 dark:hover:bg-slate-700 dark:text-slate-200 transition-colors"
                >
                  {l.flag} {l.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Left Side - Info Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 dark:from-blue-900 dark:via-indigo-900 dark:to-slate-900 p-12 flex-col justify-between relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl"></div>

        <div className="z-10 space-y-8">
          {/* Logo & Title */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl">
                <Car size={36} className="text-white" />
              </div>
              <h1 className="text-5xl font-bold text-white">
                AvtoTest<span className="text-blue-300">.uz</span>
              </h1>
            </div>
            <p className="text-blue-100 text-lg leading-relaxed max-w-md">
              Haydovchilik guvohnomasini olish uchun eng yaxshi tayyorgarlik
              platformasi
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4 max-w-md">
            <div className="flex items-start gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Shield size={24} className="text-blue-200" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">
                  Professional Savollar
                </h3>
                <p className="text-blue-200 text-sm">
                  Rasmiy imtihon savollariga asoslangan test tizimi
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Users size={24} className="text-blue-200" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">
                  Osongina O'rganish
                </h3>
                <p className="text-blue-200 text-sm">
                  Qulay interfeys va tushunarliligi bilan ajralib turadi
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Award size={24} className="text-blue-200" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">
                  Natijalarni Kuzatish
                </h3>
                <p className="text-blue-200 text-sm">
                  O'z yutuqlaringizni kuzatib boring va takomillashing
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Developer Info */}
        <div className="z-10 pt-8 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
              MA
            </div>
            <div>
              <p className="text-white/70 text-sm">Bu sayt yaratuvchisi</p>
              <p className="text-white font-semibold text-lg">
                Muhammadsolih Abduvosiyev
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo - only on small screens */}
          <div className="lg:hidden mb-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Car size={28} className="text-blue-600 dark:text-blue-400" />
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
                AvtoTest
                <span className="text-blue-600 dark:text-blue-400">.uz</span>
              </h1>
            </div>
            <div className="bg-blue-50 dark:bg-slate-700/50 rounded-xl p-4 border border-blue-100 dark:border-slate-600">
              <p className="text-slate-600 dark:text-slate-300 text-sm font-medium mb-1">
                Dasturchi
              </p>
              <p className="text-slate-800 dark:text-white font-bold text-base">
                Muhammadsolih Abduvosiyev
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl dark:border dark:border-slate-700 p-8 transition-colors">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
                {mode === "login" ? t("login_title") : t("register_title")}
              </h2>
              <p className="text-slate-500 dark:text-slate-400">
                {mode === "login" ? t("login_desc") : t("register_desc")}
              </p>
            </div>

            <div className="flex p-1 bg-slate-100 dark:bg-slate-700 rounded-xl mb-6">
              <button
                onClick={() => {
                  setMode("login");
                  setError("");
                  setUsername("");
                  setPassword("");
                }}
                className={`flex-1 py-3 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${mode === "login" ? "bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-md" : "text-slate-500 dark:text-slate-400"}`}
              >
                <LogIn size={16} /> {t("btn_login")}
              </button>
              <button
                onClick={() => {
                  setMode("register");
                  setError("");
                  setUsername("");
                  setPassword("");
                }}
                className={`flex-1 py-3 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${mode === "register" ? "bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-md" : "text-slate-500 dark:text-slate-400"}`}
              >
                <UserPlus size={16} /> {t("btn_register")}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  {t("name_label")}
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder={t("name_placeholder")}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  {t("pass_label")}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder={
                    mode === "register"
                      ? t("new_pass_placeholder")
                      : t("pass_placeholder")
                  }
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 text-sm rounded-xl border-2 border-red-100 dark:border-red-800 font-medium">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl font-semibold text-white transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {mode === "login" ? t("btn_login") : t("btn_register")}
              </button>
            </form>

            <div className="text-center text-xs text-slate-400 dark:text-slate-500 mt-6 font-medium">
              {t("app_footer_credit")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
