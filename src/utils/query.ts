import { createFilter } from "vite";

interface RequestQuery {
  vue?: boolean;
  str?: string;
  type?: "script" | "template" | "style" | "custom";
  index?: number;
  lang?: string;
  raw?: boolean;
  scoped?: boolean;
}

export function parseRequest(id: string) {
  const [filename, rawQuery] = id.split("?", 2);
  const query = Object.fromEntries(new URLSearchParams(rawQuery)) as RequestQuery;

  if(query.vue != null) {
    query.vue = true;
  }
  if(query.index != null) {
    query.index= Number(query.index);
  }
  if(query.raw != null) {
    query.raw = true;
  }
  if(query.scoped != null) {
    query.scoped = true;
  }

  return {
    filename,
    query
  }
}

const vueFilter = createFilter(/\.vue$/);
const javaScriptFilter = createFilter(/\.js$/);

export function isVueFile(filename: string) {
  return vueFilter(filename);
}

export function isJavaScriptFile(filename: string) {
  return javaScriptFilter(filename);
}

export function inVuxProject(id: string) {
  return inNodeModules && id.includes("node_modules/vux");
}

export function inNodeModules(id: string) {
  return id.includes("node_modules");
}