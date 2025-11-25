<h4>vercel</h4>
<p>https://avto-test-uz-zeta.vercel.app/</p>



# 🚗 AvtoTest Uz - Frontend Documentation

Ushbu loyiha O'zbekiston haydovchilik guvohnomasi imtihoniga tayyorgarlik ko'rish uchun mo'ljallangan **Single Page Application (SPA)** hisoblanadi.

Hozirgi holatda loyiha **Serverless** rejimida ishlaydi (Ma'lumotlar `LocalStorage` va `Firebase Realtime Database` orqali sinxronizatsiya qilinadi).

---

## 🛠 Texnologiyalar (Frontend)

- **Framework:** React.js (v18+)
- **Build Tool:** Vite (yoki Create React App)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Routing:** React Router DOM v6
- **Icons:** Lucide React
- **Hozirgi Baza:** Firebase Realtime Database + LocalStorage (Simulation)

---

## 🚀 Loyihani ishga tushirish

1. **Repositoryni klonlash:**
   ```bash
   git clone <repo-url>
   cd avtotest-app
   ```

2. **Kutubxonalarni o'rnatish:**
   ```bash
   npm install
   ```

3. **Loyihani yoqish:**
   ```bash
   npm start
   # yoki
   npm run dev
   ```

---

## 👨‍💻 Backend Dasturchi uchun Vazifalar (Technical Requirements)

Hozirgi `services/db.ts` fayli vaqtinchalik "Mock Database" vazifasini bajaradi. Sizning vazifangiz quyidagi funksionallikni ta'minlaydigan **REST API** yoki **GraphQL** serverni yaratish va ulashdan iborat.

### 1. Autentifikatsiya (Auth)
Tizimda 2 xil rol mavjud: `USER` va `ADMIN`.

- **POST** `/api/auth/register` - Yangi foydalanuvchi ro'yxatdan o'tishi.
- **POST** `/api/auth/login` - Tizimga kirish (JWT token qaytarishi kerak).
- **GET** `/api/auth/me` - Token orqali user ma'lumotlarini olish.

> **Eslatma:** Admin paroli va huquqlari alohida himoyalangan bo'lishi kerak.

### 2. Ma'lumotlar Tuzilishi (Data Schema)

Quyidagi TypeScript interfeyslari asosida baza jadvallarini yarating:

#### **User (Foydalanuvchilar)**
```typescript
interface User {
  id: string;           // UUID
  name: string;         // Username
  password: string;     // Hashed password
  role: 'USER' | 'ADMIN';
  avatar?: string;      // URL or Base64
  totalPoints: number;  // Yig'ilgan umumiy ballar
  lastActive: Date;     // Online status uchun
  createdAt: Date;
}
```

#### **Question (Savollar)**
```typescript
interface Question {
  id: string;
  questionText: string; // Savol matni
  image?: string;       // Rasm URL
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: 'A' | 'B' | 'C' | 'D';
}
```

#### **TestResult (Natijalar)**
```typescript
interface TestResult {
  id: string;
  userId: string;       // Foreign Key -> User
  date: Date;
  totalQuestions: number;
  correctCount: number; // Nechta to'g'ri
  scorePercentage: number; // Foizda (masalan 85)
  timeSpentSeconds: number;
  details: JSON;        // Qaysi savolga nima javob bergani (History uchun)
}
```

#### **ChatMessage (Chat/Xabarlar)**
```typescript
interface ChatMessage {
  id: string;
  senderId: string;     // Kim yubordi
  receiverId: string;   // Kimga yubordi (Admin <-> User)
  text: string;
  timestamp: Date;
  read: boolean;        // O'qilganlik statusi
}
```

---

### 3. Talab qilinadigan API Endpoints

Quyidagi funksiyalar Frontendda `services/db.ts` ichida simulyatsiya qilingan. Ularni API ga o'tkazish kerak:

#### **Savollar (Questions)**
- `GET /api/questions` - Barcha savollarni olish (Virtual Scroll uchun).
- `POST /api/questions` - Yangi savol qo'shish (Admin).
- `PUT /api/questions/:id` - Savolni tahrirlash.
- `DELETE /api/questions/:id` - Savolni o'chirish.
- `DELETE /api/questions` - Barcha savollarni tozalash.

#### **Foydalanuvchilar (Users)**
- `GET /api/users` - Admin uchun userlar ro'yxati.
- `DELETE /api/users/:id` - Userni ban qilish/o'chirish.
- `PUT /api/users/profile` - User o'z profilini (avatar, parol) yangilashi.

#### **Reyting (Leaderboard)**
- `GET /api/leaderboard?period=daily` - Kunlik top reyting.
- `GET /api/leaderboard?period=monthly` - Oylik top reyting.

#### **Chat (Real-time)**
- Tizimda Admin va User o'rtasida jonli suhbat bor.
- **WebSocket (Socket.io)** yoki **Long Polling** ishlatish tavsiya etiladi.
- `GET /api/messages/:userId` - Yozishmalar tarixi.
- `POST /api/messages` - Xabar yuborish.
- `PUT /api/messages/read` - Xabarni o'qilgan deb belgilash.

---

### 4. Hozirgi "Mock" Logikasi qayerda?

Barcha ma'lumotlar bilan ishlash logikasi **`src/services/db.ts`** faylida joylashgan.
Backend tayyor bo'lgach, ushbu fayldagi funksiyalarni `fetch` yoki `axios` so'rovlariga almashtirish kifoya.

Mavjud funksiyalar:
- `getQuestions()` -> `axios.get('/api/questions')`
- `loginUser()` -> `axios.post('/api/auth/login')`
- `saveResult()` -> `axios.post('/api/results')`
- va hokazo.

---

### 5. Xavfsizlik Talablari
1. **Rasmlar:** Hozircha rasmlar Base64 formatida saqlanmoqda. Backendda buni **S3** yoki **Static File Storage** ga o'tkazish tavsiya etiladi (Rasmlar hajmi oshib ketmasligi uchun).
2. **Rate Limiting:** Chat va Test topshirishda spamdan himoya.
3. **Validatsiya:** Parol uzunligi (min 4), ism takrorlanmasligi backend tarafda ham tekshirilishi shart.

---

**Muallif:** Muhammadsolih Abduvosiyev
**Sana:** 2025
