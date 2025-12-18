import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'ADMIN' | 'MANAGER' | 'USER';

export interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, username: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  hasRole: (requiredRoles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users for testing - In production, this would be a database
const DEMO_USERS: (User & { password: string })[] = [
  { id: '1', email: 'admin@demo.com', username: 'Admin User', password: 'admin123', role: 'ADMIN' },
  { id: '2', email: 'manager@demo.com', username: 'Manager User', password: 'manager123', role: 'MANAGER' },
  { id: '3', email: 'user@demo.com', username: 'Regular User', password: 'user123', role: 'USER' },
];

const STORAGE_KEY = 'demo_auth_user';
const REGISTERED_USERS_KEY = 'demo_registered_users';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const getAllUsers = (): (User & { password: string })[] => {
    const registered = localStorage.getItem(REGISTERED_USERS_KEY);
    const registeredUsers = registered ? JSON.parse(registered) : [];
    return [...DEMO_USERS, ...registeredUsers];
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const allUsers = getAllUsers();
    const foundUser = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

    if (!foundUser) {
      return { success: false, error: 'Invalid email or password' };
    }

    const { password: _, ...userWithoutPassword } = foundUser;
    setUser(userWithoutPassword);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userWithoutPassword));
    return { success: true };
  };

  const signup = async (email: string, password: string, username: string): Promise<{ success: boolean; error?: string }> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Validation
    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }

    const allUsers = getAllUsers();
    if (allUsers.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: 'Email already registered' };
    }

    // Create new user with default USER role
    const newUser: User & { password: string } = {
      id: crypto.randomUUID(),
      email,
      username,
      password,
      role: 'USER',
    };

    // Store in registered users
    const registered = localStorage.getItem(REGISTERED_USERS_KEY);
    const registeredUsers = registered ? JSON.parse(registered) : [];
    registeredUsers.push(newUser);
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(registeredUsers));

    // Auto-login after signup
    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userWithoutPassword));

    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const hasRole = (requiredRoles: UserRole[]): boolean => {
    if (!user) return false;
    return requiredRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
