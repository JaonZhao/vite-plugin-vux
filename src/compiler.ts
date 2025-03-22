import { type SFCBlock, type SFCDescriptor } from "vue/compiler-sfc";

import { tryRequire } from "./utils/module";

export interface Block extends SFCBlock {
  filename: string;
  destory?: boolean;
}

export interface TransFormPlugin {
  name: string,
  fn: (block: Block) => Block | void | null | undefined; 
}

let compiler;

function getCompiler() {
  if(!compiler) {
    throw new Error(
      `compiler is null.` +
        `please load compiler.`
    )
  }

  return compiler;
}

export function getType(block: Block) {
  return block.type;
}

export function getFileName(block: Block) {
  return block.filename;
}

export function getAttrs(block: Block) {
  return block.attrs;
}

export function transferAttrs(attrs) {
  return Object.entries(attrs)
}

export function getContent(block: Block) {
  return block.content;
}

function attrsToString(attrs: [string, string | true][]) {
  return attrs.map(([key, value]) => ` ${key}="${value}"`).join("");
}

function transformBlockWithPlugins(block: Block, plugins: TransFormPlugin[] = []) {
  return plugins.reduce((acc, cur) => {
    if(!cur || typeof cur.fn !== "function") {
      return acc;
    }
    
    const result = cur.fn(acc);
    if(!result) {
      return acc;
    } else if(result.destory) {
      return "";
    }

    return result;
  }, block);
}

export function initCompiler(root: string) {
  compiler = tryRequire('vue/compiler-sfc', root) || tryRequire('vue/compiler-sfc');

  if (!compiler) {
    throw new Error(
      `Failed to resolve vue/compiler-sfc.\n` +
        `@vitejs/plugin-vue2 requires vue (>=2.7.0) ` +
        `to be present in the dependency tree.`
    )
  }
}

export function compileVue(filename: string, source: string, sourceMap: boolean = true) {
  const compiler = getCompiler();
  const descriptor = compiler.parse({
    filename,
    source,
    sourceMap
  }) as SFCDescriptor;

  const template = descriptor.template as Block;
  if(template) {
    template.filename = filename;
  }

  const script = descriptor.script as Block;
  if(script) {
    script.filename = filename;
  }

  const styles = descriptor.styles
    .filter(style => style !== null)
    .map(style => ({...style, filename})) as Block[];

  const customBlocks = descriptor.customBlocks
    .filter(customBlock => customBlock !== null)
    .map(customBlock => ({...customBlock, filename})) as Block[];

  return {
    template,
    script,
    styles,
    customBlocks,
  }
}

function transfomBlockToCode(block: Block) {
  if(!block) return "";

  const type = getType(block);
  const content = getContent(block);
  const attrsStr = attrsToString(Object.entries(getAttrs(block)));

  return `<${type} ${attrsStr}>${content}</${type}>`
}

export function transformTemplate(template: Block, plugins: TransFormPlugin[] = []) {
  if(!template) return "";

  const newTemplate = transformBlockWithPlugins(template, plugins);
  return transfomBlockToCode(newTemplate as Block);
}

export function transformScript(script: Block, plugins: TransFormPlugin[] = []) {
  if(!script) return "";

  const newScript = transformBlockWithPlugins(script, plugins);
  return transfomBlockToCode(newScript as Block)
}

export function transformStyles(styles: Block[], plugins: TransFormPlugin[] = []) {
  if(!styles.length) return [];

  return styles.reduce((acc, styleBlock) => {
    const newStyleBlock = transformBlockWithPlugins(styleBlock, plugins);

    if(newStyleBlock) {
      acc.push(transfomBlockToCode(newStyleBlock));
    }

    return acc;
  }, []);
}

export function transformCustomBlocks(customBlocks: Block[], plugins: TransFormPlugin[] = []) {
  if(!customBlocks.length) return [];

  return customBlocks.reduce((acc, customBlock) => {
    const newCustomBlock = transformBlockWithPlugins(customBlock, plugins);

    if(!newCustomBlock) return acc;

    acc.push(transfomBlockToCode(newCustomBlock));

    return acc
  }, []);
}

export function generateVue(template: string, script: string, styles: string[], customBlocks: string[]) {
  return [template, script, ...styles, ...customBlocks].join("");
}

export function createTransformPlugin(name: string, fn: (block: Block) => void|null|undefined): TransFormPlugin {
  return { name, fn }
}