import { type Config } from "./index";
import { removeTag, reserveTag } from "./dom";
import { 
  type Block, 
  type TransFormPlugin, 
  getContent 
} from "./compiler";

export function createSsrTransformPlugin(name: string, config: Config): TransFormPlugin {
  const ssr = config.ssr;

  return {
    name: name,
    fn: (block: Block) => {
      const content = getContent(block);
      const [remove, reserve] = ssr 
        ? ["v-no-ssr", "v-ssr"]
        : ["v-ssr", "v-no-ssr"];

      const newContent = reserveTag(removeTag(content, remove), reserve);
      block.content = newContent;

      return block;
    }
  }
}