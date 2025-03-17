import fs from "node:fs";
import path from "node:path";
import stripeComments from "strip-css-comments";

import {
  type VuxPlugin,
  VuxPluginName,
  type VuxPluginStyleParser,
  getVuxPlugin
} from "./vuxApi";

interface VuxPluginTheme extends VuxPlugin {
  name: "less-theme",
  path: string;
}

export function getVuxStylePath(root: string) {
  return path.resolve(root, "node_modules", "vux", "src/styles/variable.less");
}

export function getThemeVariables(root: string, plugins: VuxPlugin[]) {
  const [ plugin ] = plugins.filter(plugin => plugin.name === "less-theme");

  if(!plugin) {
    return {}
  }

  return getVariables(path.resolve(root, (plugin as VuxPluginTheme).path));
}

export function parseStyle(code: string, plugins: VuxPlugin[]) {
  const [ plugin ] = plugins.filter(plugin => plugin.name === "style-parser") as [VuxPluginStyleParser];

  return plugin && typeof plugin.fn === "function"
    ? plugin.fn(code)
    : code;
}

function trim(str: string | undefined) {
  if (!str) {
    return "";
  } else {
    return str.replace(/^\s+|\s+$/g, "");
  }
}

function getVariables(filePath: string) {
  const text = fs.readFileSync(filePath, "utf-8");
  const variables: Record<string, string> = {};

  stripeComments(text)
    .split("\n")
    .forEach((line: string) => {
      if (trim(line).indexOf("//") === 0 || trim(line).indexOf("/*") === 0) {
        return;
      }

      if (line.indexOf("//") > 0) {
        line = trim(line.slice(0, line.indexOf("//")));
      }
      if (line.indexOf("/*") > 0) {
        line = trim(line.slice(0, line.indexOf("/*")));
      }

      const pair = line.split(":");
      if (pair.length < 2) {
        if (!/@import/.test(pair[0])) {
          return;
        }

        const pariFilePath = path.resolve(
          path.dirname(filePath),
          pair[0]
            .replace(/;/g, "")
            .replace("@import", "")
            .replace(/'/g, "")
            .replace(/"/g, "")
            .replace(/\s+/g, "")
            .trim()
        );
        const partVariables: Record<string, string> =
          getVariables(pariFilePath);

        for (let key in partVariables) {
          variables[key] = partVariables[key];
        }
      } else {
        let key = pair[0].replace("\r", "").replace("@", "");
        if (!key) {
          return;
        }

        key = key.trim();
        if (!/^[A-Za-z0-9_-]*$/.test(key)) {
          console.log(`[vux-loader] 疑似不合法命名，将被忽略：${key}`);
          return;
        }

        const value = pair[1]
          .replace(";", "")
          .replace("\r", "")
          .replace(/^\s+|\s+$/g, "");

        variables[key] = value;
      }
    });

  return variables;
}

import { 
  type Block, 
  type TransFormPlugin,
  getContent,
  getAttrs,
} from "./compiler";
import { type Config } from "./index";

export function createStyleTransformPlugin(name, config: Config): TransFormPlugin{
  const plugin = getVuxPlugin(config.plugins, VuxPluginName.STYLE_PARSER) as VuxPluginStyleParser;

  return {
    name: name,
    fn: (styleBlock: Block) => {
      const attrs = getAttrs(styleBlock);

      if(attrs["lang"] === "less" && plugin && typeof plugin.fn === "function") {
        const content = getContent(styleBlock);
        const newContent = plugin.fn(content);

        styleBlock.content = newContent;
      }
  
      return styleBlock;
    }
  }
}