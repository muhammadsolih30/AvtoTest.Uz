import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  FileText,
  Video,
  Download,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";

interface Material {
  id: string;
  title: string;
  category: string;
  type: "article" | "video" | "pdf";
  description: string;
  content?: string;
  url?: string;
}

const MATERIALS: Material[] = [
  {
    id: "mat1",
    title: "Yo'l Harakati Qoidalari - To'liq Qo'llanma",
    category: "TRAFFIC_RULES",
    type: "article",
    description:
      "O'zbekiston Respublikasi yo'l harakati qoidalari to'liq matni",
    content: `
# YO'L HARAKATI QOIDALARI

## 1-BOB. UMUMIY QOIDALAR

### 1.1. Qo'llanish doirasi
Ushbu Qoidalar O'zbekiston Respublikasining butun hududida yo'l harakati ishtirokchilarining xatti-harakatlarini tartibga soladi.

### 1.2. Asosiy tushunchalar
- **Yo'l** - transport vositalarining harakatlanishi uchun mo'ljallangan va maxsus belgilar bilan belgilangan...
- **Transport vositasi** - mexanik yoki boshqa energiya manbai yordamida harakatlanadigan...

## 2-BOB. UMUMIY MAJBURIYATLAR

### 2.1. Haydovchining majburiyatlari
Haydovchi quyidagilarni amalga oshirishi shart:
- Yo'l harakati qoidalariga rioya qilish
- Transport vositasini texnik jihatdan ishonchli holatda saqlash
- Boshqa yo'l harakati ishtirokchilarini xavf ostiga qo'ymaslik

...
    `,
  },
  {
    id: "mat2",
    title: "Yo'l Belgilari Lug'ati",
    category: "ROAD_SIGNS",
    type: "article",
    description:
      "Barcha yo'l belgilari va ularning ma'nolari batafsil tushuntirilgan",
    content: `
# YO'L BELGILARI LUG'ATI

## OGOHLANTIRUVCHI BELGILAR (1-guruh)

### 1.1 - Xavfli burilish o'ngga
Bu belgi yo'lning o'ng tomonga keskin burilishini bildiradi. Haydovchi tezlikni kamaytirib, ehtiyot bo'lishi kerak.

### 1.2 - Xavfli burilish chapga
Yo'lning chap tomonga keskin burilishi haqida ogohlantiradi.

### 1.11 - Temir yo'l kesishmasi
Haydovchini oldinda temir yo'l kesishmasi borligidan ogohlantiradi.

## USTUNLIK BERISH BELGILARI (2-guruh)

### 2.1 - Asosiy yo'l
Ushbu belgi o'rnatilgan yo'l asosiy yo'l hisoblanadi.

### 2.4 - Yo'l bering
Haydovchi asosiy yo'lda harakatlanayotgan transport vositalariga yo'l berishi shart.

...
    `,
  },
  {
    id: "mat3",
    title: "Birinchi Tibbiy Yordam Ko'rsatish",
    category: "FIRST_AID",
    type: "article",
    description: "Yo'l-transport hodisalarida birinchi yordam berish qoidalari",
    content: `
# BIRINCHI TIBBIY YORDAM

## FAVQULODDA VAZIYATLARDA HARAKAT TARTIBI

### 1. Xavfsizlikni ta'minlash
- Voqea joyida xavfsizlikni ta'minlang
- Favqulodda chiroq signalini yoqing
- Ogohlantiruvchi uchburchakni qo'ying

### 2. Tez yordam chaqirish
- 103 raqamiga qo'ng'iroq qiling
- Voqea joyi va jabrlanganlar sonini xabar qiling

### 3. Jabrlanganlarni ko'zdan kechirish
- Nafas olish va yurak urishini tekshiring
- Qon ketishini to'xtating
- Shok holatini oldini oling

## QON KETISHINI TO'XTATISH

### Arterial qon ketishi
1. Jarohatlangan joydan yuqoriroq turniket qo'ying
2. Vaqtni qayd eting
3. Tez yordam kelguncha kuzatib boring

...
    `,
  },
  {
    id: "mat4",
    title: "Haydash Texnikasi - Video Darslik",
    category: "DRIVING_TECHNIQUES",
    type: "video",
    description: "Xavfsiz haydash texnikasi va maslahatlar",
    url: "https://youtube.com/watch?v=example",
  },
  {
    id: "mat5",
    title: "Transport Vositasi Texnik Xizmati",
    category: "VEHICLE_MECHANICS",
    type: "pdf",
    description: "Avtomobilga texnik xizmat ko'rsatish qo'llanmasi",
    url: "/materials/vehicle-service.pdf",
  },
  {
    id: "mat6",
    title: "Jarimalar Jadvali 2024",
    category: "PENALTIES",
    type: "article",
    description: "Yo'l harakati qoidalarini buzganlik uchun jarimalar",
    content: `
# JARIMALAR JADVALI 2024

## TEZLIK REJIMINI BUZISH

| Qoidabuzarlik | Jarima miqdori |
|---------------|----------------|
| 20 km/soat gacha oshirish | Ogohlantirish |
| 20-40 km/soat oshirish | 1 MRHH |
| 40-60 km/soat oshirish | 3 MRHH |
| 60 km/soat va undan ko'proq | Huquqlardan mahrum qilish |

## XAVFSIZLIK KAMARI

Xavfsizlik kamarini taqmagan holda haydash - 0.5 MRHH

## MAST HOLDA HAYDASH

- Birinchi marta - 50 MRHH + huquqlardan mahrum qilish
- Takroriy - 100 MRHH + 3 yilgacha huquqlardan mahrum qilish

MRHH - Minimal Rezident Haq (2024 yil: 340,000 so'm)

...
    `,
  },
];

const StudyMaterials: React.FC = () => {
  const navigate = useNavigate();
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(
    null,
  );
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const categories = [
    { id: "all", name: "Barchasi" },
    { id: "TRAFFIC_RULES", name: "Yo'l Qoidalari" },
    { id: "ROAD_SIGNS", name: "Yo'l Belgilari" },
    { id: "FIRST_AID", name: "Birinchi Yordam" },
    { id: "DRIVING_TECHNIQUES", name: "Haydash Texnikasi" },
    { id: "VEHICLE_MECHANICS", name: "Texnik Xizmat" },
    { id: "PENALTIES", name: "Jarimalar" },
  ];

  const filteredMaterials =
    filterCategory === "all"
      ? MATERIALS
      : MATERIALS.filter((m) => m.category === filterCategory);

  const getIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="w-6 h-6" />;
      case "pdf":
        return <Download className="w-6 h-6" />;
      default:
        return <FileText className="w-6 h-6" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "video":
        return "from-red-500 to-red-600";
      case "pdf":
        return "from-green-500 to-green-600";
      default:
        return "from-blue-500 to-blue-600";
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-900 dark:to-purple-900 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => navigate("/user")}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Orqaga qaytish"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <BookOpen className="w-8 h-8" />
          <h1 className="text-3xl font-bold">O'quv Materiallari</h1>
        </div>
        <p className="text-indigo-100 ml-12">
          Haydovchilik bo'yicha to'liq ma'lumotlar va qo'llanmalar
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilterCategory(cat.id)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              filterCategory === cat.id
                ? "bg-blue-600 text-white"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Materials Grid */}
      {!selectedMaterial ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMaterials.map((material) => (
            <div
              key={material.id}
              onClick={() => setSelectedMaterial(material)}
              className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 cursor-pointer transition-all group hover:shadow-lg"
            >
              <div
                className={`w-12 h-12 rounded-lg bg-gradient-to-br ${getTypeColor(material.type)} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}
              >
                {getIcon(material.type)}
              </div>

              <h3 className="font-bold text-slate-800 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                {material.title}
              </h3>

              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                {material.description}
              </p>

              <div className="flex items-center justify-between">
                <span
                  className={`text-xs px-3 py-1 rounded-full ${
                    material.type === "video"
                      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      : material.type === "pdf"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                  }`}
                >
                  {material.type === "video"
                    ? "Video"
                    : material.type === "pdf"
                      ? "PDF"
                      : "Maqola"}
                </span>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Material Detail View
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setSelectedMaterial(null)}
            className="mb-4 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            ← Orqaga
          </button>

          <div className="flex items-start gap-4 mb-6">
            <div
              className={`w-16 h-16 rounded-xl bg-gradient-to-br ${getTypeColor(selectedMaterial.type)} flex items-center justify-center text-white`}
            >
              {getIcon(selectedMaterial.type)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                {selectedMaterial.title}
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                {selectedMaterial.description}
              </p>
            </div>
          </div>

          {selectedMaterial.type === "article" && selectedMaterial.content && (
            <div className="prose dark:prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 leading-relaxed">
                {selectedMaterial.content}
              </div>
            </div>
          )}

          {selectedMaterial.type === "video" && (
            <div className="aspect-video bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center">
              <p className="text-slate-500 dark:text-slate-400">
                Video player bu yerda bo'ladi
              </p>
            </div>
          )}

          {selectedMaterial.type === "pdf" && (
            <div className="text-center py-12 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <Download className="w-16 h-16 mx-auto text-slate-400 mb-4" />
              <a
                href={selectedMaterial.url}
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                PDF ni yuklab olish
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudyMaterials;
