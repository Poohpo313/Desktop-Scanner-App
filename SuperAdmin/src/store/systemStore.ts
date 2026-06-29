import { create } from "zustand";
import type { SystemConfig } from "../types";

type SystemState = {
  config: Partial<SystemConfig>;
  setConfig: (c: Partial<SystemConfig>) => void;
};

export const useSystemStore = create<SystemState>((set) => ({
  config: {},
  setConfig: (config) => set({ config }),
}));
