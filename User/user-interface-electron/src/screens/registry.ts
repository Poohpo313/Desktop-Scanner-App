import type { ComponentType } from "react";

const modules = import.meta.glob<{ default: ComponentType }>("./*.tsx", { eager: true });

export const screenRegistry: Record<string, ComponentType> = {};

for (const [path, mod] of Object.entries(modules)) {
  const file = path.split("/").pop() ?? "";
  if (file === "index.ts" || file === "registry.ts") continue;
  const slug = file.replace(/\.tsx$/, "");
  if (mod.default) screenRegistry[slug] = mod.default;
}
