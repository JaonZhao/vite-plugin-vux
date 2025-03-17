import path from "node:path";
import fs from "node:fs";
import yaml from "js-yaml";
import _ from "lodash";

import { type Config } from "./index";
import { getContent, getFileName, getType, type Block } from "./compiler";
import { getVuxPlugin, VuxPlugin, VuxPluginI18n, VuxPluginName } from "./vuxApi";

function getComponentName(id: string) {
  const [, name] = path.dirname(id).replace(/\//g, "").split("components");
  return name;
}

function isVuxFile(filename: string) {
  return false;
}

function isVueFile(filename: string) {
  return false;
}

export function createI18nTransformPluginFor$t(name: string, config: Config) {
  const plugin = getVuxPlugin(config.plugins, VuxPluginName.I18N) as VuxPluginI18n;

  const {
    dynamic,
    locale,
    vuxFunctionName,
    functionName,
    staticTranslations,
    langs,
    staticReplace,
  } = _.merge({
    dynamic: false,
    locale: "zh-CN",
    vuxFunctionName: "$t",
    functionName: "$t",
    staticTranslations: {},
    langs: ["en", "zh-CN"],
    staticReplace: false
  }, plugin ? {
    dynamic: !plugin.vuxStaticReplace,
    locale: plugin.vuxLocale,
    vuxFunctionName: plugin.vuxFunctionName,
    functionName: plugin.functionName,
    langs: plugin.localeList,
    staticTranslations: plugin.staticTranslations,
    staticReplace: plugin.staticReplace
  } : {})
  
  const localesPath = path.resolve(config.root, "node_modules", "vux", "src/locales/all.yml");
  const locales = yaml.load(fs.readFileSync(localesPath, "utf8"));

  const I18N_REG = /\$t\('?(.*?)'?\)/g;

  return {
    name: name,
    fn: (template: Block) => {
      const filename = getFileName(template);

      if(filename.includes("node_modules/vux")) {
        const name = getComponentName(filename);

        const newContent = getContent(template)
          .replace(I18N_REG, (match, p1) => {
            const key = `vux.${name}.${p1}`;
            if(match.includes("/*")) {
              const str = match.slice(match.indexOf("/*") + 2, match.indexOf("*/") - 1);
              const map = str.split(",").reduce((acc, cur) => {
                const [key, value] = cur.trim().split(":").map(item => item.trim());
                acc[key] = value;
                return acc;
              }, {});
      
              return map[locale];
            }
      
            if(match.includes("'")) {
              return `'${locales[locale][key]}'`;
            }
      
            return p1;
          });

        template.content = newContent;

        return template;
      }

    }
  }
}

export function createI18nTransformPluginForCustomBlock(name: string, config: Config) {
  return {
    name: name,
    fn: (customBlock: Block) => {
      const filename = getFileName(customBlock);
      const type = getType(customBlock);

      if(filename.includes("node_modules/vux") && type === "i18n") {
        customBlock.destory = true;
        return customBlock;
      }
    }
  }
}