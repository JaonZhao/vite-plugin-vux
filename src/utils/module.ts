import { createRequire } from "node:module";

const _require = createRequire(import.meta.url);

export function tryRequire(id: string, from?: string) {
  try {
    return from 
      ? _require(_require.resolve(id, { paths: [from] }))
      : _require(id);
  } catch (error) {
    
  }
}

export function isNodeModule(path: string) {
  return /node_modules/.test(path);
}