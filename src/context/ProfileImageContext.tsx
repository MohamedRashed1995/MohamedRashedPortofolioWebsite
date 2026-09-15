import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchProfileImage, resetProfileImage, uploadProfileImage } from '@/services/api';

const DEFAULT_AVATAR = '/profile.jpg';

interface ProfileImageContextType {
  profileImage: string;
  profileImageVersion?: string;
  hasCustomImage: boolean;
  setCustomImage: (file: File) => Promise<void>;
  resetToDefault: () => Promise<void>;
}

const ProfileImageContext = createContext<ProfileImageContextType | undefined>(undefined);

export const ProfileImageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profileImage, setProfileImage] = useState(DEFAULT_AVATAR);
  const [profileImageVersion, setProfileImageVersion] = useState<string | undefined>();
  const [hasCustomImage, setHasCustomImage] = useState(false);

  useEffect(() => {
    let active = true;
    fetchProfileImage()
      .then((media) => {
        if (!active || !media) return;
        setProfileImage(media.url);
        setProfileImageVersion(media.version);
        setHasCustomImage(true);
      })
      .catch((error) => console.error('Failed to load profile image:', error));
    return () => {
      active = false;
    };
  }, []);

  const setCustomImage = async (file: File) => {
    const media = await uploadProfileImage(file);
    setProfileImage(media.url);
    setProfileImageVersion(media.version);
    setHasCustomImage(true);
  };

  const resetToDefault = async () => {
    await resetProfileImage();
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
