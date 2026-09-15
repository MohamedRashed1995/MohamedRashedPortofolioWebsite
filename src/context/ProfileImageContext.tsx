import React, { createContext, useContext, useState } from 'react';

const DEFAULT_AVATAR = '/profile.jpg';
const PROFILE_VERSION_KEY = 'portfolio_custom_profile_avatar_version';

interface ProfileImageContextType {
  profileImage: string;
  profileImageVersion?: string;
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
    return DEFAULT_AVATAR;
  });

  const [hasCustomImage, setHasCustomImage] = useState<boolean>(() => {
    try {
      return Boolean(localStorage.getItem(STORAGE_KEY));
    } catch {
      return false;
    }
  });

  const [profileImageVersion, setProfileImageVersion] = useState<string | undefined>(() => {
    try {
      return localStorage.getItem(PROFILE_VERSION_KEY) || undefined;
    } catch {
      return undefined;
    }
  });

  const setCustomImage = async (base64OrUrl: string) => {
    try {
      const version = Date.now().toString(36);
      localStorage.setItem(STORAGE_KEY, base64OrUrl);
      localStorage.setItem(PROFILE_VERSION_KEY, version);
      setProfileImage(base64OrUrl);
      setProfileImageVersion(version);
      setHasCustomImage(true);
    } catch (err) {
      console.error('Failed to save profile image to storage:', err);
      throw new Error('Image too large to save in browser storage. Please choose an image under 4MB.');
    }
  };

  const resetToDefault = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(PROFILE_VERSION_KEY);
    } catch {
      // ignore
    }
    setProfileImage(DEFAULT_AVATAR);
    setProfileImageVersion(undefined);
    setHasCustomImage(false);
  };

  return (
    <ProfileImageContext.Provider
      value={{
        profileImage,
        profileImageVersion,
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
