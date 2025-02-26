import path from "node:path";
import type { Plugin } from "vite";
import type * as _compiler from "vue/compiler-sfc";
import type { Options } from "./options";

import { createFilter } from "vite";

import { mergeOptions, hasPlugin, PluginName } from "./options";
import { tryRequire } from "./utils/module";
import { resolveCompiler } from "./compiler";
import { parseJavaScript } from "./javaScript";

export default function vuePlugin(rawOptions: Options): Plugin[] {
  const pwd = process.cwd();

  const options = mergeOptions({
    root: pwd,
    ssr: false,
    compiler: null,
    plugins: [],
    maps: {},
  }, rawOptions);
  if(!options.compiler) {
    options.compiler = resolveCompiler(pwd);
  }
  if(hasPlugin(PluginName.VUX_UI, options)) {
    options.componentRecords = tryRequire(
      path.resolve(options.root, "node_modules/vux/src/components/map.json")
    );
  }


  return [{
    name: "vite-plugin-vux:pre",
    enforce: "pre",
  }, {
    name: "vite-plugin-vux:normal",
    config() {
      return {
        resolve: {
          extensions: [".js", ".ts", ".vue"],
        }
      }
    },
    async transform(oldCode, id) {
      const filter = createFilter(/\.js$/);
      if(!filter(id)) {
        return;
      }

      const { code, map } = await parseJavaScript(oldCode, options);

      return {
        code,
        map
      }
    }
  }]
}
