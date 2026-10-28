import { create } from "zustand";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useAuthStore } from "./useAuthStore";
import { db } from "@/firebase/firebaseClient";
import { ensureUserProfile } from "@/lib/profileActions";
import {
  pickClientProfileFields,
  type ClientProfileUpdate,
} from "@/utils/profileFields";

export interface ProfileType {
  email: string;
  contactEmail: string;
  displayName: string;
  photoUrl: string;
  emailVerified: boolean;
  credits: number;
}

const defaultProfile: ProfileType = {
  email: "",
  contactEmail: "",
  displayName: "",
  photoUrl: "",
  emailVerified: false,
  credits: 0,
};

interface AuthState {
  authEmail?: string;
  authDisplayName?: string;
  authPhotoUrl?: string;
  authEmailVerified?: boolean;
}

function readCredits(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function profileFromDoc(
  data: Record<string, unknown> | undefined,
  authState: AuthState
): ProfileType {
  const email =
    (typeof data?.email === "string" && data.email) || authState.authEmail || "";
  const contactEmail =
    (typeof data?.contactEmail === "string" && data.contactEmail) || email;
  const displayName =
    (typeof data?.displayName === "string" && data.displayName) ||
    authState.authDisplayName ||
    "";
  const photoUrl =
    (typeof data?.photoUrl === "string" && data.photoUrl) ||
    authState.authPhotoUrl ||
    "";
  const emailVerified =
    typeof data?.emailVerified === "boolean"
      ? data.emailVerified
      : Boolean(authState.authEmailVerified);

  return {
    email,
    contactEmail,
    displayName,
    photoUrl,
    emailVerified,
    credits: readCredits(data?.credits),
  };
}

interface ProfileState {
  profile: ProfileType;
  fetchProfile: () => Promise<void>;
  updateProfile: (newProfile: ClientProfileUpdate) => Promise<void>;
}

const useProfileStore = create<ProfileState>((set, get) => ({
  profile: defaultProfile,

  fetchProfile: async () => {
    const { uid, authEmail, authDisplayName, authPhotoUrl, authEmailVerified } =
      useAuthStore.getState();
    if (!uid) return;

    const authState: AuthState = {
      authEmail,
      authDisplayName,
      authPhotoUrl,
      authEmailVerified,
    };

    try {
      try {
        await ensureUserProfile();
      } catch (error) {
        console.error("Error ensuring profile:", error);
      }

      const userRef = doc(db, `users/${uid}/profile/userData`);
      const docSnap = await getDoc(userRef);
      if (!docSnap.exists()) return;

      const remote = docSnap.data() as Record<string, unknown>;
      const profile = profileFromDoc(remote, authState);
      set({ profile });

      const identity = pickClientProfileFields({
        email: profile.email,
        contactEmail: profile.contactEmail,
        displayName: profile.displayName,
        photoUrl: profile.photoUrl,
        emailVerified: profile.emailVerified,
      });
      const changed = (Object.keys(identity) as (keyof ClientProfileUpdate)[]).some(
        (key) => identity[key] !== remote[key]
      );
      if (changed) {
        await updateDoc(userRef, identity);
      }
    } catch (error) {
      console.error("Error fetching or creating profile:", error);
    }
  },

  updateProfile: async (newProfile: ClientProfileUpdate) => {
    const uid = useAuthStore.getState().uid;
    if (!uid) return;

    const identity = pickClientProfileFields(newProfile);
    if (Object.keys(identity).length === 0) return;

    try {
      const userRef = doc(db, `users/${uid}/profile/userData`);
      await updateDoc(userRef, identity);
      set({ profile: { ...get().profile, ...identity } });
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  },
}));

export default useProfileStore;
