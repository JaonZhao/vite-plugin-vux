import path from "node:path";
import { createRequire } from "node:module";
import { createHash } from "node:crypto";

const _require = createRequire(import.meta.url);
const NODE_MODULES = "node_modules";

export function tryRequire(id: string, from?: string) {
  try {
    return from 
      ? _require(_require.resolve(id, { paths: [from] }))
      : _require(id);
  } catch (error) {
    
  }
}

export function getHash(text: string) {
  return createHash("sha256").update(text).digest("hex").substring(0, 8);
}

export function joinAttrs(attrs: Record<string, string|boolean>, excludes: string[] = []) {
  return Object
    .entries(attrs)
    .filter(([key]) => !excludes.includes(key))
    .map(([key, value]) => `${key}="${value}"`)
    .join();
}

export function getVuxDirPath() {
  return path.resolve(NODE_MODULES, "vux");
}

export function resolvePath(...paths: string[]) {
  return path.resolve(...paths);
}