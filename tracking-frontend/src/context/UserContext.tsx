import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { getProfile, ProfileResponse } from "../services/userService";


export interface UserType {
  id: string;
  name: string;
  email: string;
  phone: string;
  profile_image?: string;
}

interface UserContextType {
  user: UserType | null;
  setUser: React.Dispatch<React.SetStateAction<UserType | null>>;
  refreshUser: () => Promise<void>;
  loading: boolean; 
}


const UserContext = createContext<UserContextType | undefined>(undefined);
console.log("Context ⚡: UserContext created");

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      const response: ProfileResponse = await getProfile();
      console.log("Context 🔄: User profile refreshed:", response);
      
      if (response.success && response.user) {

        setUser(response.user as UserType);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.log("Context ℹ️: No valid session or user not logged in.");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, refreshUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};