import { Question, TestResult, User, Role, ActivityLog, ChatMessage, UserProgress, Badge, Friend, Challenge, Bookmark, UserGoal } from '../types';

const STORAGE_KEYS = {
  QUESTIONS: 'avtotest_questions',
  RESULTS: 'avtotest_results',
  USERS: 'avtotest_users',
  ACTIVITY_LOGS: 'avtotest_activity_logs',
  CHAT_MESSAGES: 'avtotest_conversations',
  USER_PROGRESS: 'avtotest_user_progress',
  FRIENDS: 'avtotest_friends',
  CHALLENGES: 'avtotest_challenges',
  BOOKMARKS: 'avtotest_bookmarks',
  STUDY_MATERIALS: 'avtotest_study_materials',
  USER_GOALS: 'avtotest_user_goals',
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
    correctAnswer: 'B',
    category: 'qoidalar'
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
    correctAnswer: 'A',
    category: 'qoidalar'
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

export const getQuestionsByCategory = (category: string): Question[] => {
  const allQuestions = getQuestions();
  return allQuestions.filter(q => q.category === category);
};

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

// ==================== YANGI FUNKSIYALAR ====================

// User Progress Functions
export const getUserProgress = (userId: string) => {
  const allProgress = safeGet(STORAGE_KEYS.USER_PROGRESS, []);
  let progress = allProgress.find((p: any) => p.userId === userId);
  
  if (!progress) {
    progress = {
      userId,
      level: 1,
      xp: 0,
      xpForNextLevel: 100,
      badges: [],
      streak: 0,
      totalTestsTaken: 0,
      perfectScores: 0,
    };
  }
  
  return progress;
};

export const updateUserProgress = (userId: string, updates: any) => {
  const allProgress = safeGet(STORAGE_KEYS.USER_PROGRESS, []);
  const index = allProgress.findIndex((p: any) => p.userId === userId);
  
  if (index >= 0) {
    allProgress[index] = { ...allProgress[index], ...updates };
  } else {
    allProgress.push({ userId, ...updates });
  }
  
  safeSet(STORAGE_KEYS.USER_PROGRESS, allProgress);
  return allProgress[index >= 0 ? index : allProgress.length - 1];
};

export const addXP = (userId: string, xp: number) => {
  const progress = getUserProgress(userId);
  let newXP = progress.xp + xp;
  let newLevel = progress.level;
  let xpForNext = progress.xpForNextLevel;
  
  while (newXP >= xpForNext) {
    newXP -= xpForNext;
    newLevel++;
    xpForNext = newLevel * 100;
  }
  
  return updateUserProgress(userId, {
    xp: newXP,
    level: newLevel,
    xpForNextLevel: xpForNext,
  });
};

// Badge Functions
export const earnBadge = (userId: string, badgeId: string) => {
  const progress = getUserProgress(userId);
  
  if (!progress.badges.includes(badgeId)) {
    const newBadges = [...progress.badges, badgeId];
    updateUserProgress(userId, { badges: newBadges });
    return true;
  }
  
  return false;
};

export const checkAndAwardBadges = (userId: string) => {
  const progress = getUserProgress(userId);
  const results = getResults(userId);
  const newBadges: string[] = [];
  
  // First test badge
  if (progress.totalTestsTaken === 1 && !progress.badges.includes('FIRST_TEST')) {
    earnBadge(userId, 'FIRST_TEST');
    newBadges.push('FIRST_TEST');
  }
  
  // 100% score badge
  const perfectScores = results.filter(r => r.scorePercentage === 100).length;
  if (perfectScores > 0 && !progress.badges.includes('SCORE_100')) {
    earnBadge(userId, 'SCORE_100');
    newBadges.push('SCORE_100');
  }
  
  // 10 tests badge
  if (results.length >= 10 && !progress.badges.includes('TESTS_10')) {
    earnBadge(userId, 'TESTS_10');
    newBadges.push('TESTS_10');
  }
  
  // 50 tests badge
  if (results.length >= 50 && !progress.badges.includes('TESTS_50')) {
    earnBadge(userId, 'TESTS_50');
    newBadges.push('TESTS_50');
  }
  
  // 100 tests badge
  if (results.length >= 100 && !progress.badges.includes('TESTS_100')) {
    earnBadge(userId, 'TESTS_100');
    newBadges.push('TESTS_100');
  }
  
  return newBadges;
};

// Friends Functions
export const getFriends = (userId: string) => {
  const allFriends = safeGet(STORAGE_KEYS.FRIENDS, []);
  return allFriends.filter((f: any) => 
    (f.userId === userId || f.friendId === userId) && f.status === 'accepted'
  );
};

export const getFriendRequests = (userId: string) => {
  const allFriends = safeGet(STORAGE_KEYS.FRIENDS, []);
  return allFriends.filter((f: any) => f.friendId === userId && f.status === 'pending');
};

export const sendFriendRequest = (userId: string, friendId: string) => {
  const allFriends = safeGet(STORAGE_KEYS.FRIENDS, []);
  
  const exists = allFriends.find((f: any) => 
    (f.userId === userId && f.friendId === friendId) ||
    (f.userId === friendId && f.friendId === userId)
  );
  
  if (exists) {
    throw new Error('Friend request already exists');
  }
  
  const newRequest = {
    userId,
    friendId,
    status: 'pending',
    addedAt: new Date().toISOString(),
  };
  
  allFriends.push(newRequest);
  safeSet(STORAGE_KEYS.FRIENDS, allFriends);
  return newRequest;
};

export const acceptFriendRequest = (userId: string, friendId: string) => {
  const allFriends = safeGet(STORAGE_KEYS.FRIENDS, []);
  const request = allFriends.find((f: any) => 
    f.userId === friendId && f.friendId === userId && f.status === 'pending'
  );
  
  if (request) {
    request.status = 'accepted';
    safeSet(STORAGE_KEYS.FRIENDS, allFriends);
    return request;
  }
  
  throw new Error('Friend request not found');
};

export const removeFriend = (userId: string, friendId: string) => {
  const allFriends = safeGet(STORAGE_KEYS.FRIENDS, []);
  const filtered = allFriends.filter((f: any) => 
    !((f.userId === userId && f.friendId === friendId) ||
      (f.userId === friendId && f.friendId === userId))
  );
  safeSet(STORAGE_KEYS.FRIENDS, filtered);
};

// Challenge Functions
export const getChallenges = (userId: string) => {
  const allChallenges = safeGet(STORAGE_KEYS.CHALLENGES, []);
  return allChallenges.filter((c: any) => 
    c.challengerId === userId || c.challengedId === userId
  );
};

export const createChallenge = (challengerId: string, challengedId: string, questionCount: number) => {
  const allChallenges = safeGet(STORAGE_KEYS.CHALLENGES, []);
  
  const newChallenge = {
    id: 'challenge_' + Date.now(),
    challengerId,
    challengedId,
    status: 'pending',
    questionCount,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
  };
  
  allChallenges.push(newChallenge);
  safeSet(STORAGE_KEYS.CHALLENGES, allChallenges);
  return newChallenge;
};

export const acceptChallenge = (challengeId: string) => {
  const allChallenges = safeGet(STORAGE_KEYS.CHALLENGES, []);
  const challenge = allChallenges.find((c: any) => c.id === challengeId);
  
  if (challenge) {
    challenge.status = 'accepted';
    safeSet(STORAGE_KEYS.CHALLENGES, allChallenges);
    return challenge;
  }
  
  throw new Error('Challenge not found');
};

export const completeChallengeTest = (challengeId: string, userId: string, score: number) => {
  const allChallenges = safeGet(STORAGE_KEYS.CHALLENGES, []);
  const challenge = allChallenges.find((c: any) => c.id === challengeId);
  
  if (challenge) {
    if (userId === challenge.challengerId) {
      challenge.challengerScore = score;
    } else {
      challenge.challengedScore = score;
    }
    
    if (challenge.challengerScore !== undefined && challenge.challengedScore !== undefined) {
      challenge.status = 'completed';
    }
    
    safeSet(STORAGE_KEYS.CHALLENGES, allChallenges);
    return challenge;
  }
  
  throw new Error('Challenge not found');
};

// Bookmark Functions
export const getBookmarks = (userId: string) => {
  const allBookmarks = safeGet(STORAGE_KEYS.BOOKMARKS, []);
  return allBookmarks.filter((b: any) => b.userId === userId);
};

export const addBookmark = (userId: string, questionId: string, note?: string) => {
  const allBookmarks = safeGet(STORAGE_KEYS.BOOKMARKS, []);
  
  const exists = allBookmarks.find((b: any) => 
    b.userId === userId && b.questionId === questionId
  );
  
  if (exists) {
    throw new Error('Bookmark already exists');
  }
  
  const newBookmark = {
    id: 'bookmark_' + Date.now(),
    userId,
    questionId,
    note,
    createdAt: new Date().toISOString(),
  };
  
  allBookmarks.push(newBookmark);
  safeSet(STORAGE_KEYS.BOOKMARKS, allBookmarks);
  return newBookmark;
};

export const removeBookmark = (bookmarkId: string) => {
  const allBookmarks = safeGet(STORAGE_KEYS.BOOKMARKS, []);
  const filtered = allBookmarks.filter((b: any) => b.id !== bookmarkId);
  safeSet(STORAGE_KEYS.BOOKMARKS, filtered);
};

// Study Materials
export const getStudyMaterials = () => {
  return safeGet(STORAGE_KEYS.STUDY_MATERIALS, [
    {
      id: 'mat1',
      title: "Yo'l harakati qoidalari - To'liq qo'llanma",
      category: 'TRAFFIC_RULES',
      type: 'article',
      content: 'Yo\'l harakati qoidalari haqida batafsil ma\'lumot...'
    },
    {
      id: 'mat2',
      title: "Yo'l belgilari lug'ati",
      category: 'ROAD_SIGNS',
      type: 'article',
      content: 'Barcha yo\'l belgilari va ularning ma\'nolari...'
    },
  ]);
};

// User Goals
export const getUserGoals = (userId: string) => {
  const allGoals = safeGet(STORAGE_KEYS.USER_GOALS, []);
  let goal = allGoals.find((g: any) => g.userId === userId);
  
  if (!goal) {
    goal = {
      userId,
      dailyTestTarget: 3,
      accuracyTarget: 80,
      weeklyTestTarget: 20,
    };
  }
  
  return goal;
};

export const updateUserGoals = (userId: string, goals: any) => {
  const allGoals = safeGet(STORAGE_KEYS.USER_GOALS, []);
  const index = allGoals.findIndex((g: any) => g.userId === userId);
  
  if (index >= 0) {
    allGoals[index] = { ...allGoals[index], ...goals };
  } else {
    allGoals.push({ userId, ...goals });
  }
  
  safeSet(STORAGE_KEYS.USER_GOALS, allGoals);
  return allGoals[index >= 0 ? index : allGoals.length - 1];
};