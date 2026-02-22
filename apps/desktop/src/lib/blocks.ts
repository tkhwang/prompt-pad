import { BLOCK_SEPARATOR, HORIZONTAL_RULE } from "@/consts";

export function splitBlocks(body: string): string[] {
  const blocks = body.split(BLOCK_SEPARATOR);
  return blocks.length === 0 ? [""] : blocks;
}

export function joinBlocks(blocks: string[]): string {
  return blocks.join(`\n${HORIZONTAL_RULE}\n`);
}
