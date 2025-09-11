import { initializeApp } from "firebase/app";
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
  apiKey: "AIzaSyBweMM4XzkmXapjzsCi0hvw1nVBUI94l4M",
  authDomain: "resumeai-8e80a.firebaseapp.com",
  projectId: "resumeai-8e80a",
  storageBucket: "resumeai-8e80a.firebasestorage.app",
  messagingSenderId: "526007232881",
  appId: "1:526007232881:web:4ce63636fd10a252d62ed0",
  measurementId: "G-VVZGNBHRH5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Authentication functions
export const emailSignIn = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const emailSignUp = (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const googleSignIn = async () => {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
};

export const logOut = () => signOut(auth);

// Export auth state observer
export const onAuth = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
