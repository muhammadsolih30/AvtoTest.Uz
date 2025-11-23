
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState, Role } from '../types';
import { initDB, updateUser, updateLastActive, getUsers } from '../services/db';

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      initDB();
      const storedUser = localStorage.getItem('avtotest_current_user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
      console.error("Auth initialization error", e);
      return null;
    }
  });

  // Security Check & Data Sync
  useEffect(() => {
    if (!user) return;
    
    // 1. Online Status (Periodically update my status)
    const onlineInterval = setInterval(() => {
      updateLastActive(user.id);
    }, 60000); // Every minute
    updateLastActive(user.id); // Immediate update on mount

    // 2. Poll Database for Deletion (Single Tab fallback)
    const securityInterval = setInterval(() => {
       const allUsers = getUsers();
       const me = allUsers.find(u => u.id === user.id);
       
       if (!me) {
          console.warn("User deleted from DB. Logging out...");
          logout();
       } else if (me.password !== user.password && user.role !== Role.ADMIN) {
           // Optional: Force logout if password changed by someone else (not typical here but good for security)
       }
    }, 2000);

    // 3. Cross-Tab Synchronization (The Fix for "Boshqa CDD" on same machine)
    // If Admin deletes user in Tab A, Tab B (this user) sees the storage event and logs out immediately.
    const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'avtotest_users') {
            const newUsers = e.newValue ? JSON.parse(e.newValue) : [];
            const stillExists = newUsers.some((u: User) => u.id === user.id);
            if (!stillExists) {
                logout();
            }
        }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(onlineInterval);
      clearInterval(securityInterval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user?.id]);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('avtotest_current_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('avtotest_current_user');
    window.location.href = '#/'; // Force redirect to home
  };

  const updateUserProfile = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('avtotest_current_user', JSON.stringify(updatedUser));
    updateUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
