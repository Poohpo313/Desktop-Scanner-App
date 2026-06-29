import { create } from "zustand";
import { keysApi } from "../api/keys.api";
import type { SerialKey } from "../types";

const STORAGE_KEY = "portal-generated-keys";

function readCachedKeys(): SerialKey[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SerialKey[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCachedKeys(keys: SerialKey[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
}

function mergeKeys(primary: SerialKey[], secondary: SerialKey[]) {
  const map = new Map<number, SerialKey>();

  for (const key of [...secondary, ...primary]) {
    map.set(key.serialId, key);
  }

  return [...map.values()].sort((a, b) => {
    const aTime = a.generatedAt ? new Date(a.generatedAt).getTime() : 0;
    const bTime = b.generatedAt ? new Date(b.generatedAt).getTime() : 0;
    return bTime - aTime;
  });
}

type KeysState = {
  keys: SerialKey[];
  loaded: boolean;
  load: () => Promise<SerialKey[]>;
  addKey: (key: SerialKey) => void;
  generateAndSave: () => Promise<SerialKey>;
};

export const useKeysStore = create<KeysState>((set, get) => ({
  keys: [],
  loaded: false,

  load: async () => {
    try {
      const keys = await keysApi.list();
      const merged = mergeKeys(keys, readCachedKeys());
      writeCachedKeys(merged);
      set({ keys: merged, loaded: true });
      return merged;
    } catch {
      const cached = readCachedKeys();
      set({ keys: cached, loaded: true });
      return cached;
    }
  },

  addKey: (key) => {
    set((state) => {
      const keys = mergeKeys([key], state.keys);
      writeCachedKeys(keys);
      return { keys, loaded: true };
    });
  },

  generateAndSave: async () => {
    const key = await keysApi.generate();
    get().addKey(key);
    return key;
  },
}));
