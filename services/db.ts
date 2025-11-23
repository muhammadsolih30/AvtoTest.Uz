
import { Question, TestResult, User, Role, ActivityLog, ChatMessage } from '../types';

const STORAGE_KEYS = {
  QUESTIONS: 'avtotest_questions',
  RESULTS: 'avtotest_results',
  USERS: 'avtotest_users',
  ACTIVITY_LOGS: 'avtotest_activity_logs',
  CHAT_MESSAGES: 'avtotest_conversations' 
};

const hashPassword = (str: string): string => {
  let hash = 0;
  if (str.length === 0) return hash.toString();
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; 
  }
  return "hashed_" + Math.abs(hash).toString(16);
};

const INITIAL_QUESTIONS: Question[] = [
  {
    id: 'q1',
    questionText: "Chorrahada tartibga soluvchining qo'li yuqoriga ko'tarilgan bo'lsa, qaysi transport vositalariga harakatlanish taqiqlanadi?",
    options: {
      A: "Faqat tramvaylarga",
      B: "Barcha transport vositalariga va piyodalarga",
      C: "Faqat o'ngga burilayotganlarga",
      D: "Hech kimga taqiqlanmaydi"
    },
    correctAnswer: 'B'
  },
  {
    id: 'q2',
    questionText: "Aholi punktlarida transport vositalarining ruxsat etilgan yuqori tezligi qancha?",
    options: {
      A: "60 km/soat",
      B: "70 km/soat",
      C: "50 km/soat",
      D: "100 km/soat"
    },
    correctAnswer: 'A'
  }
];

// Helper to safely get data
const safeGet = <T>(key: string, defaultVal: T): T => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultVal;
  } catch (e) {
    return defaultVal;
  }
};

// Helper to safely set data
const safeSet = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    // Trigger storage event manually for same-tab updates if needed, 
    // though React state usually handles this. The built-in storage event 
    // handles cross-tab.
  } catch (e) {
    console.error("Storage Error", e);
  }
};

export const initDB = () => {
  try {
    // Questions
    if (!localStorage.getItem(STORAGE_KEYS.QUESTIONS)) {
      safeSet(STORAGE_KEYS.QUESTIONS, INITIAL_QUESTIONS);
    }
    
    // Users
    let users: User[] = safeGet(STORAGE_KEYS.USERS, []);
    
    // Check if ANY admin exists. Important: Don't check for specific ID or Name, just Role.
    const adminExists = users.some(u => u.role === Role.ADMIN);
    
    if (!adminExists) {
      // Only create default admin if NO admin exists in the entire DB
      const defaultPass = '12345';
      const hashedDefault = hashPassword(defaultPass);
      
      const adminUser: User = {
        id: 'admin_main',
        name: 'Admin',
        role: Role.ADMIN,
        createdAt: new Date().toISOString(),
        totalPoints: 0,
        password: hashedDefault,
        avatar: ''
      };
      users.push(adminUser);
      safeSet(STORAGE_KEYS.USERS, users);
    }
    
    // Logs & Messages
    if (!localStorage.getItem(STORAGE_KEYS.ACTIVITY_LOGS)) {
      safeSet(STORAGE_KEYS.ACTIVITY_LOGS, []);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES)) {
      safeSet(STORAGE_KEYS.CHAT_MESSAGES, []);
    }
  } catch (e) {
    console.error("Init DB Error", e);
  }
};

export const getQuestions = (): Question[] => safeGet(STORAGE_KEYS.QUESTIONS, []);

export const saveQuestion = (question: Question) => {
  const questions = getQuestions();
  const existingIndex = questions.findIndex(q => q.id === question.id);
  if (existingIndex >= 0) {
    questions[existingIndex] = question;
  } else {
    questions.push(question);
  }
  safeSet(STORAGE_KEYS.QUESTIONS, questions);
};

export const deleteQuestion = (id: string) => {
  const questions = getQuestions();
  const newQuestions = questions.filter(q => q.id !== id);
  safeSet(STORAGE_KEYS.QUESTIONS, newQuestions);
};

export const deleteAllQuestions = () => {
  safeSet(STORAGE_KEYS.QUESTIONS, []);
};

export const getResults = (userId?: string): TestResult[] => {
  const allResults: TestResult[] = safeGet(STORAGE_KEYS.RESULTS, []);
  if (userId) {
    return allResults.filter(r => r.userId === userId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
  return allResults;
};

export const saveResult = (result: TestResult) => {
  const allResults: TestResult[] = safeGet(STORAGE_KEYS.RESULTS, []);
  allResults.push(result);
  if (allResults.length > 10000) allResults.shift();
  safeSet(STORAGE_KEYS.RESULTS, allResults);
  
  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === result.userId);
  if (userIndex >= 0) {
    const points = Math.round(result.scorePercentage);
    users[userIndex].totalPoints = (users[userIndex].totalPoints || 0) + points;
    safeSet(STORAGE_KEYS.USERS, users);
  }
};

export const getUsers = (): User[] => safeGet(STORAGE_KEYS.USERS, []);

export const verifyAdminPassword = (password: string): boolean => {
  const users = getUsers();
  // Find ANY admin
  const admin = users.find(u => u.role === Role.ADMIN);
  
  if (!admin) return false;

  const hashedInput = hashPassword(password);
  
  // Strict check against the user object in DB
  return admin.password === hashedInput || admin.password === password;
};

export const updateAdminPassword = (newPass: string) => {
  const users = getUsers();
  const index = users.findIndex(u => u.role === Role.ADMIN);
  if (index >= 0) {
    users[index].password = hashPassword(newPass);
    safeSet(STORAGE_KEYS.USERS, users);
  }
};

export const updateUser = (updatedUser: User) => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === updatedUser.id);
  if (index >= 0) {
    users[index] = updatedUser;
    safeSet(STORAGE_KEYS.USERS, users);
  }
};

export const deleteUser = (userId: string) => {
  const users = getUsers();
  const newUsers = users.filter(u => u.id !== userId);
  safeSet(STORAGE_KEYS.USERS, newUsers);
  
  // Clean up related data
  const adminId = getAdminId();
  deleteConversation(userId, adminId);
  
  const results = safeGet<TestResult[]>(STORAGE_KEYS.RESULTS, []);
  const newResults = results.filter(r => r.userId !== userId);
  safeSet(STORAGE_KEYS.RESULTS, newResults);
};

export const registerUser = (name: string, password: string): User => {
  const users = getUsers();
  const existing = users.find(u => u.name.toLowerCase() === name.toLowerCase());
  if (existing) {
    throw new Error("Bunday ismli foydalanuvchi mavjud!");
  }

  const newUser: User = {
    // Generate a strictly unique ID
    id: 'u_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    name,
    password: hashPassword(password), 
    role: Role.USER,
    createdAt: new Date().toISOString(),
    totalPoints: 0,
    avatar: ''
  };

  users.push(newUser);
  safeSet(STORAGE_KEYS.USERS, users);
  return newUser;
};

export const loginUser = (name: string, password: string): User => {
  const users = getUsers();
  const user = users.find(u => u.name.toLowerCase() === name.toLowerCase());
  
  if (!user) {
    throw new Error("Foydalanuvchi topilmadi. Avval ro'yxatdan o'ting.");
  }
  
  const isMatch = user.password === hashPassword(password) || user.password === password;
  if (!isMatch) {
     throw new Error("Parol noto'g'ri!");
  }
  
  logActivity(user.id, user.name);
  return user;
};

export const updateLastActive = (userId: string) => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === userId);
  if (index >= 0) {
    users[index].lastActive = new Date().toISOString();
    safeSet(STORAGE_KEYS.USERS, users);
  }
};

export const logActivity = (userId: string, userName: string) => {
  const logs = safeGet<ActivityLog[]>(STORAGE_KEYS.ACTIVITY_LOGS, []);
  
  // Debounce logs: if last log for this user was < 5 min ago, just update it
  const lastLog = logs.length > 0 ? logs[logs.length - 1] : null;
  if (lastLog && lastLog.userId === userId && (new Date().getTime() - new Date(lastLog.loginTime).getTime() < 5 * 60 * 1000)) {
     lastLog.lastSeen = new Date().toISOString();
  } else {
    const newLog: ActivityLog = {
      id: Date.now().toString(),
      userId,
      userName,
      loginTime: new Date().toISOString(),
      lastSeen: new Date().toISOString()
    };
    logs.push(newLog);
    if (logs.length > 1000) logs.shift();
  }
  
  safeSet(STORAGE_KEYS.ACTIVITY_LOGS, logs);
};

export const getActivityLogs = (): ActivityLog[] => safeGet(STORAGE_KEYS.ACTIVITY_LOGS, []);

export const getAllMessages = (): ChatMessage[] => safeGet(STORAGE_KEYS.CHAT_MESSAGES, []);

export const saveMessage = (msg: ChatMessage) => {
  const msgs = getAllMessages();
  msgs.push(msg);
  if (msgs.length > 5000) msgs.shift(); 
  safeSet(STORAGE_KEYS.CHAT_MESSAGES, msgs);
};

export const getConversation = (userId1: string, userId2: string): ChatMessage[] => {
  const all = getAllMessages();
  return all.filter(m => 
    (m.senderId === userId1 && m.receiverId === userId2) ||
    (m.senderId === userId2 && m.receiverId === userId1)
  ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
};

export const getAdminId = (): string => {
  const users = getUsers();
  // Always get the ID of the actual admin user in DB
  const admin = users.find(u => u.role === Role.ADMIN);
  return admin ? admin.id : 'admin_main';
};

export const getChatUsers = (adminId: string): User[] => {
  const allMessages = getAllMessages();
  const userIds = new Set<string>();
  
  // Find anyone who has exchanged messages with admin
  allMessages.forEach(m => {
    if (m.senderId === adminId) userIds.add(m.receiverId);
    if (m.receiverId === adminId) userIds.add(m.senderId);
  });
  
  const allUsers = getUsers();
  // Return user objects for those IDs
  return allUsers.filter(u => userIds.has(u.id));
};

export const getUnreadCount = (receiverId: string, senderId?: string): number => {
  const all = getAllMessages();
  if (senderId) {
    return all.filter(m => m.receiverId === receiverId && m.senderId === senderId && !m.read).length;
  }
  return all.filter(m => m.receiverId === receiverId && !m.read).length;
};

export const markAsRead = (receiverId: string, senderId: string) => {
  const all = getAllMessages();
  let changed = false;
  const updated = all.map(m => {
    if (m.receiverId === receiverId && m.senderId === senderId && !m.read) {
      changed = true;
      return { ...m, read: true };
    }
    return m;
  });
  if (changed) {
    safeSet(STORAGE_KEYS.CHAT_MESSAGES, updated);
  }
};

export const deleteConversation = (userId1: string, userId2: string) => {
  const all = getAllMessages();
  const filtered = all.filter(m => 
    !((m.senderId === userId1 && m.receiverId === userId2) || 
      (m.senderId === userId2 && m.receiverId === userId1))
  );
  safeSet(STORAGE_KEYS.CHAT_MESSAGES, filtered);
};

export const getLeaderboard = (period: 'daily' | 'monthly' | 'yearly') => {
  const users = getUsers();
  const results = getResults();
  const now = new Date();
  
  const filteredResults = results.filter(r => {
    const d = new Date(r.date);
    if (period === 'daily') {
      return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    } else if (period === 'monthly') {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    } else {
      return d.getFullYear() === now.getFullYear();
    }
  });

  const scoresMap: Record<string, number> = {};
  filteredResults.forEach(r => {
    scoresMap[r.userId] = (scoresMap[r.userId] || 0) + Math.round(r.scorePercentage);
  });

  const leaderboard = users
    .map(u => ({
      ...u,
      periodScore: scoresMap[u.id] || 0
    }))
    .filter(u => u.role !== Role.ADMIN && u.periodScore > 0)
    .sort((a, b) => b.periodScore - a.periodScore);

  return leaderboard;
};

export const getStats = () => {
  const questions = getQuestions();
  const results = getResults();
  const users = getUsers();
  return {
    totalQuestions: questions.length,
    totalTestsTaken: results.length,
    totalUsers: users.filter(u => u.role === Role.USER).length
  };
};

export const resetSystem = (type: 'users' | 'questions' | 'all') => {
    try {
      if (type === 'users' || type === 'all') {
          const users = getUsers();
          const admin = users.find(u => u.role === Role.ADMIN);
          // Keep Admin, delete others
          safeSet(STORAGE_KEYS.USERS, admin ? [admin] : []);
          safeSet(STORAGE_KEYS.RESULTS, []);
          safeSet(STORAGE_KEYS.ACTIVITY_LOGS, []);
          safeSet(STORAGE_KEYS.CHAT_MESSAGES, []);
      }
      if (type === 'questions' || type === 'all') {
          safeSet(STORAGE_KEYS.QUESTIONS, INITIAL_QUESTIONS);
      }
    } catch(e) { console.error(e); }
};
