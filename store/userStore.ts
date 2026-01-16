import { create } from "zustand";
import { persist } from "zustand/middleware";

const DEFAULT_AVATAR = "/icons/user-avatar.png";

interface UserState {
  profilePicture: string;
  isUploadingProfilePicture: boolean;
  profilePictureError: string | null;
  setProfilePicture: (picture: string) => void;
  setIsUploadingProfilePicture: (isUploading: boolean) => void;
  setProfilePictureError: (error: string | null) => void;
  resetProfilePicture: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      profilePicture: DEFAULT_AVATAR,
      isUploadingProfilePicture: false,
      profilePictureError: null,
      
      setProfilePicture: (picture: string) => set({ profilePicture: picture, profilePictureError: null }),
      
      setIsUploadingProfilePicture: (isUploading: boolean) => set({ isUploadingProfilePicture: isUploading }),
      
      setProfilePictureError: (error: string | null) => set({ profilePictureError: error }),
      
      resetProfilePicture: () => set({ profilePicture: DEFAULT_AVATAR, profilePictureError: null }),
    }),
    {
      name: "fox-user-storage",
      partialize: (state) => ({ profilePicture: state.profilePicture }),
    }
  )
);

export { DEFAULT_AVATAR };
