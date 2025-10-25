"use client"

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { onAuth, googleSignIn, logOut } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  role: "student" | "hr" | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
  signInWithGoogle: async () => {},
  logout: async () => {}
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<"student" | "hr" | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuth((user) => {
      setUser(user);
      if (user) {
        // Get role from localStorage
        if (typeof window !== 'undefined') {
          const userRole = localStorage.getItem(`user_role_${user.uid}`) as "student" | "hr" | null;
          setRole(userRole || "student"); // Default to student for Google sign-ins
        }
      } else {
        setRole(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      const result = await googleSignIn();
      // Set default role for Google sign-ins
      if (typeof window !== 'undefined') {
        localStorage.setItem(`user_role_${result.user.uid}`, "student");
      }
      setRole("student");
    } catch (error) {
      console.error('Google sign in failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logOut();
      setRole(null);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, signInWithGoogle, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
