"use client";

import axios from "axios";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface Profile {
  image: string;
  name: string;
  birth_date: string;
}

interface ProfileContextType {
  profileData: Profile | null;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  error: Error | null;
  updateProfileImage: (newImage: string) => void;
  refreshProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

// Provider component
export const ProfileProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  const [profileData, setProfileData] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchProfile = async () => {
    setIsLoading(true);
    setError(null);

    const authToken = process.env.NEXT_PUBLIC_AUTH_TOKEN;
    if (!authToken) {
      const tokenError = new Error("No authToken found");
      setError(tokenError);
      setIsLoading(false);
      return;
    }

    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/accounts/students/6`;

      const { data } = await axios.get(url, {
        headers: { userKey: authToken },
      });

      setProfileData(data?.student);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfileImage = (newImage: string) => {
    if (profileData) {
      setProfileData({
        ...profileData,
        image: newImage,
      });
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <ProfileContext.Provider
      value={{ profileData, isLoading, setIsLoading, error, updateProfileImage, refreshProfile: fetchProfile }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);

  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }

  return context;
};
