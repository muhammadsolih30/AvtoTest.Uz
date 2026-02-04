import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getQuestions } from "../../services/db";
import {
  BookOpen,
  AlertTriangle,
  Heart,
  Wrench,
  Car,
  DollarSign,
  ArrowLeft,
} from "lucide-react";

interface Topic {
  id: string;
  name: string;
  nameUz: string;
  description: string;
  icon: JSX.Element;
  color: string;
  questionCount: number;
}

const TOPICS: Topic[] = [
  {
    id: "umumiy",
    name: "General",
    nameUz: "Umumiy",
    description: "Umumiy bilimlar va asoslar",
    icon: <BookOpen className="w-6 h-6" />,
    color: "from-blue-500 to-blue-600",
    questionCount: 0,
  },
  {
    id: "belgilar",
    name: "Road Signs",
    nameUz: "Yo'l Belgilari",
    description: "Barcha yo'l belgilari va ularning ma'nolari",
    icon: <AlertTriangle className="w-6 h-6" />,
    color: "from-red-500 to-red-600",
    questionCount: 0,
  },
  {
    id: "qoidalar",
    name: "Traffic Rules",
    nameUz: "Harakatlanish Qoidalari",
    description: "Asosiy yo'l harakati qoidalari",
    icon: <BookOpen className="w-6 h-6" />,
    color: "from-indigo-500 to-indigo-600",
    questionCount: 0,
  },
  {
    id: "xavfsizlik",
    name: "Safety",
    nameUz: "Xavfsizlik",
    description: "Xavfsiz haydash va xavfsizlik choralari",
    icon: <Car className="w-6 h-6" />,
    color: "from-green-500 to-green-600",
    questionCount: 0,
  },
  {
    id: "texnik",
    name: "Technical",
    nameUz: "Texnik Bilim",
    description: "Avtomobil qurilmasi va texnik xizmati",
    icon: <Wrench className="w-6 h-6" />,
    color: "from-gray-500 to-gray-600",
    questionCount: 0,
  },
  {
    id: "birinchi-yordam",
    name: "First Aid",
    nameUz: "Birinchi Yordam",
    description: "Favqulodda vaziyatlarda yordam berish",
    icon: <Heart className="w-6 h-6" />,
    color: "from-pink-500 to-pink-600",
    questionCount: 0,
  },
  {
    id: "jarimalar",
    name: "Penalties",
    nameUz: "Jarimalar",
    description: "Qoidabuzarliklar va jarimalar",
    icon: <DollarSign className="w-6 h-6" />,
    color: "from-orange-500 to-orange-600",
    questionCount: 0,
  },
];

const Topics: React.FC = () => {
  const navigate = useNavigate();
  const [topics, setTopics] = useState<Topic[]>(TOPICS);
  const [totalQuestions, setTotalQuestions] = useState(0);

  // Har bir kategoriya uchun savol sonini hisoblash
  useEffect(() => {
    const allQuestions = getQuestions();
    const updatedTopics = TOPICS.map((topic) => ({
      ...topic,
      questionCount: allQuestions.filter(
        (q) => (q.category || "umumiy") === topic.id,
      ).length,
    }));
    setTopics(updatedTopics);
    setTotalQuestions(allQuestions.length);
  }, []);

  const handleTopicClick = (topicId: string, questionCount: number) => {
    if (questionCount === 0) {
      alert(
        "Bu kategoriyada hali savollar mavjud emas. Iltimos, admin panelidan savollar qo'shing.",
      );
      return;
    }
    navigate(`/quiz?topic=${topicId}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <button
              onClick={() => navigate("/user")}
              className="p-1.5 sm:p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors flex-shrink-0"
              title="Orqaga qaytish"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 dark:text-slate-400" />
            </button>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">
              📚 Mavzular bo'yicha Test
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 ml-8 sm:ml-11 md:ml-12">
            Muayyan mavzuni chuqurroq o'rganish uchun mavzuni tanlang
          </p>
        </div>

        {/* Agar savollar yo'q bo'lsa */}
        {totalQuestions === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl p-8 sm:p-12 border border-slate-200 dark:border-slate-700 shadow-sm text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
              <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white mb-2 sm:mb-3">
              Hali savollar yuklanmagan
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-4 sm:mb-6 max-w-md mx-auto">
              Testlarni boshlash uchun avval admin panelidan savollar
              qo'shilishi kerak.
            </p>
            <button
              onClick={() => navigate("/user")}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base font-medium rounded-lg transition-colors shadow-lg"
            >
              Bosh sahifaga qaytish
            </button>
          </div>
        ) : (
          <>
            {/* Topics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {topics.map((topic) => (
                <div
                  key={topic.id}
                  onClick={() =>
                    handleTopicClick(topic.id, topic.questionCount)
                  }
                  className={`bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700 transition-all shadow-sm ${
                    topic.questionCount === 0
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:border-blue-500 dark:hover:border-blue-500 cursor-pointer group hover:shadow-lg active:scale-98"
                  }`}
                >
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-gradient-to-br ${topic.color} flex items-center justify-center text-white mb-3 sm:mb-4 ${
                      topic.questionCount > 0 ? "group-hover:scale-110" : ""
                    } transition-transform`}
                  >
                    {topic.icon}
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white mb-1.5 sm:mb-2 line-clamp-1">
                    {topic.nameUz}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-3 sm:mb-4 line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem]">
                    {topic.description}
                  </p>

                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-xs sm:text-sm font-medium ${
                        topic.questionCount === 0
                          ? "text-red-500 dark:text-red-400"
                          : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {topic.questionCount === 0
                        ? "Savol yo'q"
                        : `${topic.questionCount} ta savol`}
                    </span>
                    <button
                      className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                        topic.questionCount === 0
                          ? "bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                      disabled={topic.questionCount === 0}
                    >
                      Boshlash
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg sm:rounded-xl p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-300">
                💡 <strong>Maslahat:</strong> Har bir mavzu bo'yicha kamida 80%
                natija qo'lishga harakat qiling. Bu sizga imtihonda ishonch
                beradi!
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Topics;
