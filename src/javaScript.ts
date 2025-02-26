import { ResolveOptions } from "./options";

import * as babel from "@babel/core";
import * as types from "babel-types";

const babelPluginWithTransformImports = () => ({
  visitor: {
    ImportDeclaration(path, state) {
      const source = path.node.source.value;
      const name = state.opts[source] ? source : undefined;
      const opts = state.opts[name];

      if (!opts) {
        return;
      }

      const componentRecords = opts.componentRecords as { [key: string]: string };
      const memberImports = path.node.specifiers.filter(specifier => specifier.type === "ImportSpecifier");

      const transforms = memberImports.map(memberImport => {
        const importName = memberImport.imported.name;
        const newImportSpecifier = types.importDefaultSpecifier(types.identifier(memberImport.local.name));

        return types.ImportDeclaration(
          [newImportSpecifier],
          types.stringLiteral(`vux/${componentRecords[importName]}`)
        );
      });

      if (transforms.length) {
        path.replaceWithMultiple(transforms);
      }
    }
  }
});

export async function parseJavaScript(code: string, options: ResolveOptions) {
  return babel.transform(code, {
    plugins: [[ babelPluginWithTransformImports, {
      vux: { componentRecords: options.componentRecords }
    }]]
  });
}