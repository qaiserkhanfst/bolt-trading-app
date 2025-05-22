import { createContext, useContext, useState, useEffect } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../config/firebase";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Login with email and password
  const login = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Register a new user
  const register = async (email, password, displayName) => {
    try {
      // Create the user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Update their profile with display name
      await updateProfile(userCredential.user, { displayName });

      // Store additional user data in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email,
        displayName,
        createdAt: serverTimestamp(),
        tradingMode: "MANUAL",
        defaultRiskPercent: 2,
        notificationsEnabled: true,
        emailNotifications: false,
        theme: "dark",
        defaultSymbols: ["BTCUSDT", "ETHUSDT", "BNBUSDT"],
      });

      return userCredential;
    } catch (error) {
      console.error("Error during registration:", error);
      throw error;
    }
  };

  // Logout current user
  const logout = () => {
    return signOut(auth);
  };

  // Update current user's profile
  const updateUserProfile = async (data) => {
    try {
      if (data.displayName) {
        await updateProfile(auth.currentUser, {
          displayName: data.displayName,
        });
      }

      if (data.photoURL) {
        await updateProfile(auth.currentUser, { photoURL: data.photoURL });
      }

      // Update in Firestore
      const userRef = doc(db, "users", auth.currentUser.uid);
      await setDoc(
        userRef,
        { ...data, updatedAt: serverTimestamp() },
        { merge: true }
      );

      // Refresh user state
      setCurrentUser({
        ...auth.currentUser,
        ...data,
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    let didCancel = false;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          // Get additional user data from Firestore
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            if (!didCancel) setCurrentUser({ ...user, ...userDoc.data() });
          } else {
            if (!didCancel) setCurrentUser(user);
          }
        } else {
          if (!didCancel) setCurrentUser(null);
        }
      } catch (err) {
        console.error("AuthContext: Error fetching user data:", err);
        if (!didCancel) setCurrentUser(user || null);
      } finally {
        if (!didCancel) setLoading(false);
      }
    });
    // Fallback: force loading to false after 5 seconds
    const timeout = setTimeout(() => {
      if (!didCancel) setLoading(false);
    }, 5000);
    return () => {
      didCancel = true;
      unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const value = {
    currentUser,
    login,
    register,
    logout,
    updateUserProfile,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
