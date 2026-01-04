import React, { createContext, useState, useContext, useEffect } from "react";
import { getProfile } from "@/src/services/userService";

const UserContext = createContext();
console.log("UserContext created");

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const refreshUser = async () => {
    const response = await getProfile();
    console.log("User profile refreshed:", response);
    if (response.success) {
      setUser(response.user);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
