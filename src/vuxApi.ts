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
