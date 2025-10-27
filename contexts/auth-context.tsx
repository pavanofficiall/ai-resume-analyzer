"use client"

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { onAuth, googleSignIn, logOut } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuth((user) => {
      setUser(user);
      if (user) {
        // Get role from localStorage
        if (typeof window !== 'undefined') {
          const userRole = localStorage.getItem(`user_role_${user.uid}`) as "student" | "hr" | null;
          const finalRole = userRole || "student"; // Default to student for Google sign-ins
          console.log("Auth context - User role from localStorage:", userRole, "Final role:", finalRole);
          setRole(finalRole);
          
          // Redirect based on role after authentication
          // Only redirect if user is on home page, auth page, or on a page that doesn't match their role
          const currentPath = window.location.pathname;
          const isOnHomePage = currentPath === '/';
          const isOnAuthPage = currentPath === '/auth';
          const isOnHRPage = currentPath === '/hrdashboard';
          const isOnStudentPage = ['/ai-analyzer', '/analyzer', '/builder', '/history', '/profile', '/resumes'].includes(currentPath);
          
          // Redirect logic:
          // - If on home/auth page: redirect based on role
          // - If HR user on student page: redirect to HR dashboard
          // - If student user on HR page: redirect to student page
          // - Otherwise, stay on current page
          // Temporarily disable auth context redirects for debugging
          /*
          const shouldRedirect = isOnHomePage || isOnAuthPage || 
                                (finalRole === 'hr' && isOnStudentPage) || 
                                (finalRole === 'student' && isOnHRPage);
          
          console.log("Auth context redirect check:", {
            currentPath,
            finalRole,
            isOnHomePage,
            isOnAuthPage,
            isOnHRPage,
            isOnStudentPage,
            shouldRedirect
          });
          
          if (shouldRedirect) {
            const redirectPath = finalRole === 'hr' ? '/hrdashboard' : '/ai-analyzer';
            console.log("Auth context redirecting to:", redirectPath);
            router.push(redirectPath);
          }
          */
        }
      } else {
        setRole(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [router]);

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
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
