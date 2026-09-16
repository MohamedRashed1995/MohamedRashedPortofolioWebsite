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

    const loadProfileImage = () => {
      fetchProfileImage()
        .then((media) => {
          if (!active || !media) return;
          setProfileImage(media.url);
          // Prefer the server-provided content version; fall back to updatedAt so the
          // cache-buster changes whenever the image is replaced.
          setProfileImageVersion(media.version || media.updatedAt);
          setHasCustomImage(true);
        })
        .catch((error) => console.error('Failed to load profile image:', error));
    };

    loadProfileImage();

    // Re-fetch fresh metadata when the tab/window regains focus so a stale
    // desktop session picks up an image that was updated from another device.
    const handleFocus = () => loadProfileImage();
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') loadProfileImage();
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      active = false;
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
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
