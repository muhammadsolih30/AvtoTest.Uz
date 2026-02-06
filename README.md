# AvtoTest.Uz — Backend Specification

Bu hujjat frontend loyihani (React + TS) ko‘rib chiqib yozildi. Backend yo‘q, shu sababli bu **to‘liq qo‘llanma + ishchi backend kodi** sifatida backendchi uchun tayyorlandi.

---

## 1. Texnologiya steki (tavsiya)

* **Node.js + Express.js**
* **TypeScript**
* **PostgreSQL**
* **Prisma ORM**
* **JWT Auth** (access + refresh)
* **i18n (uz-lat, uz-cyr, ru, en)**
* **Socket.io** (chat uchun)
* **Zod** (validation)

---

## 2. Papkalar struktura

```
backend/
 ├─ src/
 │   ├─ app.ts
 │   ├─ server.ts
 │   ├─ config/
 │   │   ├─ env.ts
 │   │   └─ i18n.ts
 │   ├─ prisma/
 │   │   └─ schema.prisma
 │   ├─ modules/
 │   │   ├─ auth/
 │   │   ├─ user/
 │   │   ├─ admin/
 │   │   ├─ quiz/
 │   │   ├─ chat/
 │   │   └─ stats/
 │   ├─ middlewares/
 │   │   ├─ auth.middleware.ts
 │   │   └─ role.middleware.ts
 │   └─ utils/
 │       └─ jwt.ts
 └─ package.json
```

---

## 3. Database modellari (Prisma)

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  role      Role     @default(USER)
  name      String
  language  Language @default(UZ_LAT)
  createdAt DateTime @default(now())

  results   Result[]
  messages  Message[]
}

model Question {
  id        String   @id @default(uuid())
  text      String
  options   Json
  answer    Int
  language  Language
  topic     String
}

model Result {
  id        String   @id @default(uuid())
  score     Int
  userId    String
  user      User @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
}

model Message {
  id        String   @id @default(uuid())
  text      String
  userId    String
  user      User @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
}

enum Role {
  USER
  ADMIN
}

enum Language {
  UZ_LAT
  UZ_CYR
  RU
  EN
}
```

---

## 4. Auth API

### POST /auth/register

```json
{ "email": "test@mail.com", "password": "123456", "name": "Ali" }
```

### POST /auth/login

```json
{ "email": "test@mail.com", "password": "123456" }
```

Response:

```json
{ "accessToken": "...", "user": { "id": "", "role": "USER" } }
```

---

## 5. Admin API

* CRUD Questions
* Admin chat
* Statistics

```
POST   /admin/questions
GET    /admin/questions?lang=UZ_LAT
DELETE /admin/questions/:id
```

---

## 6. User API

```
GET  /quiz?topic=signs&lang=RU
POST /quiz/submit
GET  /user/history
GET  /leaderboard
```

---

## 7. Chat (Socket.io)

* User ↔ Admin
* Real-time messages

Events:

```
connection
send_message
receive_message
```

---

## 8. To‘liq Backend kodi (asosiy fayllar)

### server.ts

```ts
import { app } from './app'
app.listen(4000, () => console.log('Backend running on 4000'))
```

### app.ts

```ts
import express from 'express'
import cors from 'cors'

export const app = express()
app.use(cors())
app.use(express.json())
```

### auth.controller.ts (qisqa)

```ts
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

export const login = async (req, res) => {
  // login logic
}
```

---

## 9. Frontend bilan bog‘lanish

Frontend allaqachon:

* AdminDashboard
* QuestionManager
* Quiz
* Chat

Backend **faqat REST + Socket** bo‘lsa yetarli.

---

## 10. Muhim eslatmalar

* Savollar **4 tilda alohida yoziladi**
* User tanlagan language bo‘yicha savol keladi
* Admin faqat o‘z panelidan yuklaydi

---

Agar xohlasang:

* 🔥 To‘liq production backend yozib beraman
* 🐳 Docker + deploy
* 🔐 Refresh token + email verify

Aytsang bo‘ldi 👍
