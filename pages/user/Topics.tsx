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
    const updatedTopics = TOPICS.map((topic) => {
      let questionCount = 0;

      if (topic.id === "umumiy") {
        // "umumiy" uchun category undefined yoki "umumiy" bo'lgan savollarni sanash
        questionCount = allQuestions.filter(
          (q) => !q.category || q.category === "umumiy",
        ).length;
      } else {
        // Boshqa kategoriyalar uchun oddiy filter
        questionCount = allQuestions.filter(
          (q) => q.category === topic.id,
        ).length;
      }

      return {
        ...topic,
        questionCount,
      };
    });

    setTopics(updatedTopics);
    setTotalQuestions(allQuestions.length);
  }, []);

  const handleTopicClick = (topicId: string, questionCount: number) => {
    // Agar savollar bo'lmasa, hech narsa qilmaymiz
    if (questionCount === 0) return;
    navigate(`/quiz?topic=${topicId}&count=20`);
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
              {topics.map((topic) => {
                const hasQuestions = topic.questionCount > 0;
                return (
                  <div
                    key={topic.id}
                    onClick={() =>
                      hasQuestions &&
                      handleTopicClick(topic.id, topic.questionCount)
                    }
                    className={`bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 transition-all shadow-sm ${
                      hasQuestions
                        ? "border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 cursor-pointer group hover:shadow-xl hover:-translate-y-1 active:scale-98"
                        : "border-slate-200 dark:border-slate-700 opacity-60 cursor-not-allowed bg-slate-50 dark:bg-slate-800/50"
                    }`}
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div
                        className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br ${topic.color} flex items-center justify-center text-white flex-shrink-0 ${
                          hasQuestions
                            ? "group-hover:scale-110 shadow-lg"
                            : "opacity-75"
                        } transition-transform`}
                      >
                        {topic.icon}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white mb-1 line-clamp-1">
                          {topic.nameUz}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                          {topic.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2">
                        {hasQuestions ? (
                          <>
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                              {topic.questionCount} ta savol
                            </span>
                          </>
                        ) : (
                          <>
                            <div className="w-2 h-2 rounded-full bg-red-400"></div>
                            <span className="text-sm font-medium text-red-500 dark:text-red-400">
                              Savol yo'q
                            </span>
                          </>
                        )}
                      </div>

                      {hasQuestions && (
                        <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 text-sm font-medium group-hover:gap-2.5 transition-all">
                          <span>Boshlash</span>
                          <svg
                            className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
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
