import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import defaultAvatar from '@/assets/profile.jpg';
import {
  getCloudinaryProfileImageUrl,
  getProfileImageUrlWithBuster,
  uploadProfileImageToCloudinary,
} from '@/services/api';

// The avatar lives in Cloudinary under a FIXED public_id, so every device
// resolves the exact same asset. Uploading again replaces it in place, which is
// what makes the picture sync across devices without any backend endpoint.
const AVATAR_URL_KEY = 'portfolio_profile_avatar';
const AVATAR_VERSION_KEY = 'portfolio_profile_avatar_version';

interface ProfileImageContextType {
  profileImage: string;
  profileImageVersion?: string;
  hasCustomImage: boolean;
  isLoading: boolean;
  setCustomImage: (file: File) => Promise<void>;
  resetToDefault: () => Promise<void>;
}

const ProfileImageContext = createContext<ProfileImageContextType | undefined>(undefined);

function readStoredAvatar(): { url: string | null; version: string | null } {
  try {
    return {
      url: localStorage.getItem(AVATAR_URL_KEY),
      version: localStorage.getItem(AVATAR_VERSION_KEY),
    };
  } catch {
    // Storage disabled (private mode): Cloudinary stays the source of truth.
    return { url: null, version: null };
  }
}

function writeStoredAvatar(url: string, version: string): void {
  try {
    localStorage.setItem(AVATAR_URL_KEY, url);
    localStorage.setItem(AVATAR_VERSION_KEY, version);
  } catch {
    // Only a local cache — the uploaded image is already safe on Cloudinary.
  }
}

function clearStoredAvatar(): void {
  try {
    localStorage.removeItem(AVATAR_URL_KEY);
    localStorage.removeItem(AVATAR_VERSION_KEY);
  } catch {
    // ignore
  }
}

export const ProfileImageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Instant first paint from the local cache (empty on a device that never
  // uploaded anything).
  const [customImageUrl, setCustomImageUrl] = useState<string | null>(() => readStoredAvatar().url);
  const [profileImageVersion, setProfileImageVersion] = useState<string | undefined>(
    () => readStoredAvatar().version ?? undefined
  );
  const [hasCustomImage, setHasCustomImage] = useState<boolean>(() => Boolean(readStoredAvatar().url));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // Fresh cache-buster per page load so a newer upload made on another device is
  // fetched instead of a browser/CDN cached copy.
  const [imageBuster, setImageBuster] = useState<number | string>(() => Date.now());

  // Revalidate against Cloudinary on mount: this is what makes a second device
  // (or a device with empty storage) show the shared avatar.
  useEffect(() => {
    let active = true;
    const mountBuster = Date.now();
    const probe = new Image();

    probe.onload = () => {
      if (!active) return;
      setCustomImageUrl(getCloudinaryProfileImageUrl());
      setImageBuster(mountBuster);
      setHasCustomImage(true);
      setIsLoading(false);
    };

    probe.onerror = () => {
      if (!active) return;
      // Nothing uploaded to Cloudinary yet (or it is unreachable): fall back to
      // the bundled default portrait.
      setCustomImageUrl(null);
      setHasCustomImage(false);
      setIsLoading(false);
    };

    probe.src = getProfileImageUrlWithBuster(getCloudinaryProfileImageUrl(), mountBuster);

    return () => {
      active = false;
      probe.onload = null;
      probe.onerror = null;
    };
  }, []);

  const profileImage = useMemo(() => {
    if (!customImageUrl) return defaultAvatar;
    return getProfileImageUrlWithBuster(customImageUrl, imageBuster);
  }, [customImageUrl, imageBuster]);

  const setCustomImage = useCallback(async (file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      throw new Error('Please select a valid image file (JPG, PNG, WEBP).');
    }

    setIsLoading(true);
    try {
      const uploaded = await uploadProfileImageToCloudinary(file);
      const version = String(uploaded.version ?? Date.now());

      setCustomImageUrl(uploaded.url);
      setProfileImageVersion(version);
      setImageBuster(version);
      setHasCustomImage(true);
      writeStoredAvatar(uploaded.url, version);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetToDefault = useCallback(async () => {
    setIsLoading(true);
    clearStoredAvatar();
    setProfileImageVersion(undefined);

    try {
      // Cloudinary assets can only be deleted with a signed request (api_secret),
      // which must never ship in frontend code. Overwriting the fixed public_id
      // with the default portrait therefore keeps the other devices in sync
      // instead of resetting this device only.
      const response = await fetch(defaultAvatar);
      const blob = await response.blob();
      const defaultFile = new File([blob], 'profile-default.jpg', {
        type: blob.type || 'image/jpeg',
      });
      const uploaded = await uploadProfileImageToCloudinary(defaultFile);
      setImageBuster(String(uploaded.version ?? Date.now()));
    } catch (error) {
      console.warn('Could not sync the default avatar to Cloudinary; resetting locally only.', error);
    } finally {
      setCustomImageUrl(null);
      setHasCustomImage(false);
      setIsLoading(false);
    }
  }, []);

  return (
    <ProfileImageContext.Provider
      value={{
        profileImage,
        profileImageVersion,
        hasCustomImage,
        isLoading,
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
