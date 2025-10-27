import { initializeApp, getApps } from "firebase/app";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged,
    User
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: "G-VVZGNBHRH5"
};

// Lazy initialization of Firebase
let app: any = null;
let auth: any = null;

const initializeFirebase = () => {
  if (!app && typeof window !== 'undefined') {
    // Only initialize on client side
    try {
      app = initializeApp(firebaseConfig);
      auth = getAuth(app);
    } catch (error) {
      console.warn('Firebase initialization failed:', error);
      // Return null to prevent crashes
      return null;
    }
  }
  return auth;
};

// Export auth getter that initializes Firebase lazily
export const getAuthInstance = () => {
  if (!auth) {
    auth = initializeFirebase();
  }
  return auth;
};

// Authentication functions with lazy initialization
export const emailSignIn = (email: string, password: string) => {
  const authInstance = getAuthInstance();
  if (!authInstance) throw new Error('Firebase not initialized');
  return signInWithEmailAndPassword(authInstance, email, password);
};

export const emailSignUp = async (email: string, password: string, role: "student" | "hr" = "student") => {
  const authInstance = getAuthInstance();
  if (!authInstance) throw new Error('Firebase not initialized');
  const userCredential = await createUserWithEmailAndPassword(authInstance, email, password);
  // Store role in localStorage for now (you can later move this to Firestore)
  if (typeof window !== 'undefined') {
    const storageKey = `user_role_${userCredential.user.uid}`;
    localStorage.setItem(storageKey, role);
    console.log("Stored role in localStorage:", storageKey, "=", role);
  }
  return userCredential;
};

export const googleSignIn = async () => {
  const authInstance = getAuthInstance();
  if (!authInstance) throw new Error('Firebase not initialized');
  const provider = new GoogleAuthProvider();
  return signInWithPopup(authInstance, provider);
};

export const logOut = () => {
  const authInstance = getAuthInstance();
  if (!authInstance) throw new Error('Firebase not initialized');
  return signOut(authInstance);
};

// Export auth state observer
export const onAuth = (callback: (user: User | null) => void) => {
  const authInstance = getAuthInstance();
  if (!authInstance) {
    // If Firebase is not initialized, call callback with null immediately
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(authInstance, callback);
};
