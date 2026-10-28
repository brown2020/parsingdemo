import { useEffect } from "react";
import { useAuthStore } from "./useAuthStore";
import useProfileStore from "./useProfileStore";

export const useInitializeStores = () => {
  const uid = useAuthStore((state) => state.uid);
  const authReady = useAuthStore((state) => state.authReady);

  const fetchProfile = useProfileStore((state) => state.fetchProfile);

  useEffect(() => {
    if (!authReady || !uid) return;

    void fetchProfile();
  }, [authReady, fetchProfile, uid]);
};
