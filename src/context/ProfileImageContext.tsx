import React, { createContext, useContext, useState } from 'react';
import defaultAvatar from '@/assets/profile.jpg';

interface ProfileImageContextType {
  profileImage: string;
  hasCustomImage: boolean;
  setCustomImage: (base64OrUrl: string) => Promise<void>;
  resetToDefault: () => void;
}

const STORAGE_KEY = 'portfolio_custom_profile_avatar';

const ProfileImageContext = createContext<ProfileImageContextType | undefined>(undefined);

export const ProfileImageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profileImage, setProfileImage] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && saved.startsWith('data:image')) {
        return saved;
      }
    } catch {
      // ignore storage errors
    }
    return defaultAvatar;
  });

  const [hasCustomImage, setHasCustomImage] = useState<boolean>(() => {
    try {
      return Boolean(localStorage.getItem(STORAGE_KEY));
    } catch {
      return false;
    }
  });

  const setCustomImage = async (base64OrUrl: string) => {
    try {
      localStorage.setItem(STORAGE_KEY, base64OrUrl);
      setProfileImage(base64OrUrl);
      setHasCustomImage(true);
    } catch (err) {
      console.error('Failed to save profile image to storage:', err);
      throw new Error('Image too large to save in browser storage. Please choose an image under 4MB.');
    }
  };

  const resetToDefault = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setProfileImage(defaultAvatar);
    setHasCustomImage(false);
  };

  return (
    <ProfileImageContext.Provider
      value={{
        profileImage,
        hasCustomImage,
        setCustomImage,
        resetToDefault,
      }}
    >
      {children}
    </ProfileImageContext.Provider>
  );
};

export function useProfileImage(): ProfileImageContextType {
  const context = useContext(ProfileImageContext);
  if (!context) {
    throw new Error('useProfileImage must be used within a ProfileImageProvider');
  }
  return context;
}
