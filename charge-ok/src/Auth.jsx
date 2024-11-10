import React, { createContext, useContext, useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";

// Create the AuthContext
const AuthContext = createContext();

// AuthProvider component to wrap the app
export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null); // Store the user's UID
  const [isAdmin, setIsAdmin] = useState(false);

  const sendUserIdToBackend = async (data) => {
    console.log("User ID:", data.id);
    try {
      const response = await fetch(
        "http://localhost:9000/.netlify/functions/api/is-admin", // development
        {
          method: "POST", // Specify the HTTP method
          headers: {
            "Content-Type": "application/json", // Tell server to expect JSON data
          },
          body: JSON.stringify(data), // Convert JavaScript object to JSON string
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log("Is Admin:", result);
        setIsAdmin(result);
      } else {
        console.error("Error:", response.statusText);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
        setUserId(user.uid); // Set the UID when the user is logged in
        sendUserIdToBackend({ id: user.uid }); // Check if user is admin
      } else {
        setIsLoggedIn(false);
        setUserId(null); // Clear UID when logged out
        setIsAdmin(false);
      }
    });

    // Cleanup the listener on unmount
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, setIsLoggedIn, userId, isAdmin }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};
