import React from "react";
import { useNavigate } from "react-router-dom";
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
    id: "ROAD_SIGNS",
    name: "Road Signs",
    nameUz: "Yo'l Belgilari",
    description: "Barcha yo'l belgilari va ularning ma'nolari",
    icon: <AlertTriangle className="w-6 h-6" />,
    color: "from-red-500 to-red-600",
    questionCount: 50,
  },
  {
    id: "TRAFFIC_RULES",
    name: "Traffic Rules",
    nameUz: "Yo'l Harakati Qoidalari",
    description: "Asosiy yo'l harakati qoidalari",
    icon: <BookOpen className="w-6 h-6" />,
    color: "from-blue-500 to-blue-600",
    questionCount: 100,
  },
  {
    id: "FIRST_AID",
    name: "First Aid",
    nameUz: "Birinchi Tibbiy Yordam",
    description: "Favqulodda vaziyatlarda yordam berish",
    icon: <Heart className="w-6 h-6" />,
    color: "from-pink-500 to-pink-600",
    questionCount: 30,
  },
  {
    id: "VEHICLE_MECHANICS",
    name: "Vehicle Mechanics",
    nameUz: "Transport Vositasi Mexanikasi",
    description: "Avtomobil qurilmasi va texnik xizmati",
    icon: <Wrench className="w-6 h-6" />,
    color: "from-gray-500 to-gray-600",
    questionCount: 40,
  },
  {
    id: "DRIVING_TECHNIQUES",
    name: "Driving Techniques",
    nameUz: "Haydash Texnikasi",
    description: "Xavfsiz haydash usullari",
    icon: <Car className="w-6 h-6" />,
    color: "from-green-500 to-green-600",
    questionCount: 60,
  },
  {
    id: "PENALTIES",
    name: "Penalties",
    nameUz: "Jarimalar",
    description: "Qoidabuzarliklar va jarimalar",
    icon: <DollarSign className="w-6 h-6" />,
    color: "from-orange-500 to-orange-600",
    questionCount: 25,
  },
];

const Topics: React.FC = () => {
  const navigate = useNavigate();

  const handleTopicClick = (topicId: string) => {
    navigate(`/quiz?topic=${topicId}`);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => navigate("/user")}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            title="Orqaga qaytish"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
            📚 Mavzular bo'yicha Test
          </h1>
        </div>
        <p className="text-slate-600 dark:text-slate-400 ml-12">
          Muayyan mavzuni chuqurroq o'rganish uchun mavzuni tanlang
        </p>
      </div>

      {/* Topics Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {TOPICS.map((topic) => (
          <div
            key={topic.id}
            onClick={() => handleTopicClick(topic.id)}
            className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all cursor-pointer group hover:shadow-lg"
          >
            <div
              className={`w-14 h-14 rounded-xl bg-gradient-to-br ${topic.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}
            >
              {topic.icon}
            </div>

            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
              {topic.nameUz}
            </h3>

            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              {topic.description}
            </p>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {topic.questionCount} ta savol
              </span>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
                Boshlash
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          💡 <strong>Maslahat:</strong> Har bir mavzu bo'yicha kamida 80% natija
          qo'lishga harakat qiling. Bu sizga imtihonda ishonch beradi!
        </p>
      </div>
    </div>
  );
};

export default Topics;
