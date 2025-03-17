import { createRequire } from "node:module";
import { createHash } from "node:crypto";

const _require = createRequire(import.meta.url);

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

