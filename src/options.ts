import type * as _compiler from "vue/compiler-sfc";
import _ from 'lodash';

export enum PluginName {
  SCRIPT_PARSER = "script-parser",
  STYLE_PARSER = "style-parser",
  JS_PARSER = "js-parser",
  TEMPLATE_PARSER = "template-parser",
  TEMPLATE_FEATURE_SWITCH = "template-feature-switch",
  VUX_UI = "vux-ui",
  I18N = "i18n",
  LESS_THEME = "less-theme"
}

interface BasePlugin {
  name: string;
}
interface PluginNormalParser extends BasePlugin {
  name: PluginName.SCRIPT_PARSER | PluginName.STYLE_PARSER | PluginName.JS_PARSER;
  fn: (source: string) => string;
}
interface PluginSpecialParser {
  name: PluginName.TEMPLATE_PARSER;
  replaceList?: Array<{
    test: RegExp;
    replaceString: string;
  }>;
  fn: PluginNormalParser["fn"];
}
interface PluginSwitch {
  name: PluginName.TEMPLATE_FEATURE_SWITCH;
  features: {
    [key: string]: boolean;
  }
}
interface PluginUI {
  name: PluginName.VUX_UI;
}
interface PluginI18n {
  name: PluginName.I18N;
}
interface PluginTheme {
  name: PluginName.LESS_THEME;
  pth: string;
}

interface Options {
  ssr: boolean;
  plugins: Array<PluginNormalParser | PluginSpecialParser | PluginSwitch | PluginUI | PluginI18n | PluginTheme>;
}

interface ResolveOptions extends Options {
  root: string;
  compiler: typeof _compiler| null;
  componentRecords: Record<string, string>;
}

export type {
  Options,
  ResolveOptions
}

export function mergeOptions(defaultOptions, userOptions) {
  return _.merge(defaultOptions, userOptions);
}

export function hasPlugin(name: string, options: Options) {
  return options.plugins.some(plugin => plugin.name === name);
}