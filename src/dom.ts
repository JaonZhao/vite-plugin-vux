export function createTagRegex(name: string) {
  return new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\/${name}>`, 'g');
}

export function removeTag(code: string, tag: string) {
  const regex = createTagRegex(tag);
  return code.replace(regex, () => "");
}

export function reserveTag(code: string, tag: string) {
  const regex = createTagRegex(tag);
  return code.replace(regex, (tag, text) => text);
}
