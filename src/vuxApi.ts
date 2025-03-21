import fs from "node:fs";
import path from "node:path";
import stripeComments from "strip-css-comments";

import { getVuxDirPath, tryRequire } from "./utils/module";

export enum VuxPluginName {
  LESS_THEME = "less-theme",
  STYLE_PARSER = "style-parser",
  I18N = "i18n",
}

export interface VuxPlugin {
  name: string;
}

export interface VuxPluginStyleParser extends VuxPlugin {
  name: VuxPluginName.STYLE_PARSER;
  fn: (code: string) => any;
}

export interface VuxPluginTheme extends VuxPlugin {
  name: VuxPluginName.LESS_THEME;
  path: string;
}

export interface VuxPluginI18n extends VuxPlugin {
  name: VuxPluginName.I18N;
  vuxStaticReplace: boolean;
  vuxLocale: string;
  vuxFunctionName: string;
  functionName: string;
  localeList: string[];
  staticTranslations: {};
  staticReplace: boolean;
}

export function getVuxPlugin(plugins: VuxPlugin[], name: VuxPluginName) {
  const [ plugin ] = plugins.filter((plugin) => plugin.name === name);
  return plugin;
}

export function getComponentMap(root: string) {
  const componentMapPath = path.resolve(root, getVuxDirPath(), "src/components/map.json");
  return tryRequire(componentMapPath);
}

export function getStylePath(root: string) {
  return path.resolve(root, getVuxDirPath(), "src/styles/variable.less");
}

export function getThemeVariables(root: string, plugins: VuxPlugin[]) {
  const [ plugin ] = plugins.filter(plugin => plugin.name === VuxPluginName.LESS_THEME);

  if(!plugin) {
    return {}
  }

  return getVariables(path.resolve(root, (plugin as VuxPluginTheme).path));
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

function trim(str: string | undefined) {
  if (!str) {
    return "";
  } else {
    return str.replace(/^\s+|\s+$/g, "");
  }
}