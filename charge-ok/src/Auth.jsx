import React, { createContext, useContext, useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import axios from "axios";

// Create the AuthContext
const AuthContext = createContext();

// AuthProvider component to wrap the app
export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track if user is logged in
  const [userId, setUserId] = useState(null); // Store the user's UID
  const [isAdmin, setIsAdmin] = useState(false); // Track if user has admin privileges

  // Function to check if the user is an admin
  const checkAdminStatus = async (userId) => {
    try {
      console.log("Checking admin status for:", userId);

      const response = await axios.post(
        "http://localhost:8888/.netlify/functions/api/is-admin",
        { id: userId },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Set isAdmin based on response.data.isAdmin, assuming backend returns { isAdmin: true } or { isAdmin: false }
      const isAdminStatus = response.data.isAdmin === true;
      setIsAdmin(isAdminStatus);
      console.log("Admin check result (isAdmin):", isAdminStatus);
    } catch (error) {
      console.error("Error checking admin status:", error);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
        setUserId(user.uid);
        console.log("User logged in with UID:", user.uid);

        // Check if the logged-in user is an admin
        checkAdminStatus(user.uid);
      } else {
        // Clear authentication state on logout
        setIsLoggedIn(false);
        setUserId(null);
        setIsAdmin(false);
        console.log("User logged out, isAdmin set to false");
      }
    });

    // Clean up the listener on component unmount
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, userId, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};
