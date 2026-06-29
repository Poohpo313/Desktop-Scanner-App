import { create } from "zustand";

type ProfileState = {
  username: string;
  fullName: string;
  email: string;
  hydrateFromApi: (profile: {
    username: string;
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
  }) => void;
};

export const useProfileStore = create<ProfileState>((set) => ({
  username: "superadmin",
  fullName: "System Administrator",
  email: "",
  hydrateFromApi: (profile) => {
    const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(" ").trim();
    set({
      username: profile.username,
      fullName: fullName || profile.username,
      email: profile.email ?? "",
    });
  },
}));

function initialsFromName(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function useProfileInitials() {
  return useProfileStore((state) => initialsFromName(state.fullName || state.username));
}
