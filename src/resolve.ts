import path from "node:path";
import fs from "node:fs";
import { createRequire } from "node:module";

import * as babel from "@babel/core";
import * as types from "babel-types";

const _require = createRequire(import.meta.url);

export function tryRequire(id: string, from?: string) {
  try {
    return from 
      ? _require(_require.resolve(id, { paths: [from] }))
      : _require(id);
  } catch (error) {
    
  }
}

export function getResolveMap(root: string) {
  const filePath = path.resolve(root, "node_modules", "vux", "src/components/map.json");
  return tryRequire(filePath);
}

export function transformVuxImport(code: string, map: Record<string, string>) {
  return babel.transform(code, {
    plugins: [[
      () => ({
        visitor: {
          ImportDeclaration(path, state) {
            const source = path.node.source.value;

            if(!state.opts[source]) return;

            const memberImports = path.node.specifiers.filter(specifier => specifier.type === "ImportSpecifier");

            const transforms = memberImports.map(memberImport => {
              const importName = memberImport.imported.name;
              const newImportSpecifier = types.importDefaultSpecifier(types.identifier(memberImport.local.name));

              return types.ImportDeclaration(
                [newImportSpecifier],
                types.stringLiteral(`vux/${map[importName]}`)
              )
            });
            if(transforms.length) {
              path.replaceWithMultiple(transforms);
            }
          }
        }
      }),
    ]]
  })
}

