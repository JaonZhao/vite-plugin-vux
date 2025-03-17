import path from "node:path";
import fs from "node:fs";

import { type Config } from "./index";
import { getAttrs, getContent, getFileName, type Block } from "./compiler";

function replaceEnd(str: string, name: string) {
  const list = str.split('');

  let start = false
  let end = false
  for (let i = 0; i < list.length; i++) {
    if (list[i] === '<' && list[i + 1] !== '/') {
      if (list.slice(i + 1, i + 1 + name.length).join('') === name) {
        start = true
      } else {
        start = false
      }
    }
    if (list[i] === '/' && list[i + 1] === '>') {
      if (start) {
        end = true
        list[i] = 'V'
        list[i + 1] = 'V'
      }
    }
  }

  return list.join('').replace(/VV/g, `></${name}>`)
}

function getAttributes (string: string) {
  let match = string.match(/\s+(.*?)="(.*?)"/g)

  let obj = {}
  let list = match.map(one => {
    return one.replace(/^\s+|\s+$/g, '').replace(/\.native/g, '')
  })

  for (let i = 0; i < list.length; i++) {
    const pair = list[i].split('=').map(one => {
      return one.replace(/"/g, '')
    })
    if (pair.length === 2) {
      obj[pair[0]] = pair[1]
    } else if (pair.length > 2) {
      obj[pair[0]] = pair.slice(1).join('=')
    }

  }
  return {
    stringList: list.join(' '),
    arrayList: list,
    objectList: obj
  }
}

function updateAttrs(attrs, svgDirir: string) {
  const size = attrs.objectList.size || 24;
  const type = attrs.objectList.type;
  const className = !attrs.objectList.class 
    ? `vux-x-icon vux-x-icon-${type}`
    : `vux-x-icon vux-x-icon-${type} ${attrs.objectList.class}`;
  const props = 
    Object
    .entries(attrs.objectList)
    .reduce((acc, cur) => {
      const [key, value] = cur;
      return key !== "class" 
        ? acc + ` ${key}="${value}"`
        : acc
    }, "");

  const svgPath = path.resolve(svgDirir, `${type}.svg`);
  return fs.readFileSync(svgPath, "utf8")
    .replace(`width="512"`, `width="${size}"`)
    .replace(`height="512"`, `height="${size}"`)
    .replace(`<svg`, `<svg class="${className}" ${props}`);
}

export function createXiconTransformPlugin(name: string, config: Config) {
  const svgDir = path.resolve(config.root, "node_modules", "vux/src/icons");
  const reg1 = new RegExp(`<x-icon([\\s\\S]*?)>.*?</x-icon>`, "g");
  const reg2 = new RegExp(`<x-icon([\\s\\S]*?)\/>`, 'g');

  return {
    name: name,
    fn: (templateBlock: Block) => {
      const content = getContent(templateBlock);

      const newContent = replaceEnd(content, "x-icon")
        .replace(reg1, (match, p1) => {
          const attrs = getAttributes(p1);
          return updateAttrs(attrs, svgDir);
        })
        .replace(reg2, (match, p1) => {
          const attrs = getAttributes(p1);
          return updateAttrs(attrs, svgDir);
        });

      templateBlock.content = newContent;

      return templateBlock;
    }
  }
}

export function createTemplateAtrrsTransformPlugin(name: string, config: Config) {
  return {
    name: name,
    fn: (template: Block) => {
      const filename = getFileName(template);
      if(filename.includes("node_modules/vux")) {
        const attrs = getAttrs(template);
        if(attrs["lang"]) {
          delete attrs["lang"];
        }

        template.attrs = attrs;

        return template;
      }
    }
  }
}