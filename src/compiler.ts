import { createRequire } from "node:module";
import type * as _compiler from "vue/compiler-sfc";

const _require = createRequire(import.meta.url);

function tryRequire(id: string, from?: string) {
  try {
    return from 
      ? _require(_require.resolve(id, { paths: [from] }))
      : _require(id);
  } catch (error) {
    
  }
}

export function resolveCompiler(root: string): typeof _compiler {
  const compiler = tryRequire('vue/compiler-sfc', root) || tryRequire('vue/compiler-sfc');

  if (!compiler) {
    throw new Error(
      `Failed to resolve vue/compiler-sfc.\n` +
        `@vitejs/plugin-vue2 requires vue (>=2.7.0) ` +
        `to be present in the dependency tree.`
    )
  }

  return compiler;
}