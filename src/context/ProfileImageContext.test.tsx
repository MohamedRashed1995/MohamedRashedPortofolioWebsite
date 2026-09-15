import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ProfileImageProvider, useProfileImage } from './ProfileImageContext';

const apiMocks = vi.hoisted(() => ({
  fetchProfileImage: vi.fn(),
  uploadProfileImage: vi.fn(),
  resetProfileImage: vi.fn(),
}));

vi.mock('@/services/api', () => apiMocks);

function Harness() {
  const { profileImage, setCustomImage } = useProfileImage();
  return (
    <div>
      <img src={profileImage} alt="profile" />
      <button type="button" onClick={() => setCustomImage(new File(['image'], 'profile.webp', { type: 'image/webp' }))}>
        upload
      </button>
    </div>
  );
}

describe('ProfileImageProvider', () => {
  afterEach(() => cleanup());

  beforeEach(() => {
    vi.clearAllMocks();
    apiMocks.fetchProfileImage.mockResolvedValue({
      url: 'https://res.cloudinary.com/demo/image/upload/profile.webp',
      version: 'abc123',
      contentType: 'image/webp',
      updatedAt: '2026-09-15T00:00:00Z',
    });
    apiMocks.uploadProfileImage.mockResolvedValue({
      url: 'https://res.cloudinary.com/demo/image/upload/profile-new.webp',
      version: 'def456',
      contentType: 'image/webp',
      updatedAt: '2026-09-15T00:00:00Z',
    });
  });

  it('renders the backend profile image after loading', async () => {
    render(<ProfileImageProvider><Harness /></ProfileImageProvider>);

    await waitFor(() => expect(screen.getByAltText('profile')).toHaveAttribute('src', 'https://res.cloudinary.com/demo/image/upload/profile.webp'));
  });

  it('uploads a File and replaces the displayed image with the response URL', async () => {
    const user = userEvent.setup();
    render(<ProfileImageProvider><Harness /></ProfileImageProvider>);

    await user.click(screen.getByRole('button', { name: 'upload' }));
    await waitFor(() => expect(apiMocks.uploadProfileImage).toHaveBeenCalledWith(expect.any(File)));
    await waitFor(() => expect(screen.getByAltText('profile')).toHaveAttribute('src', 'https://res.cloudinary.com/demo/image/upload/profile-new.webp'));
  });
});