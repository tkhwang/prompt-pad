export const AUTO_SAVE_DELAY_MS = 800;

export const HORIZONTAL_RULE = "---";
export const EM_DASH = "—"; // macOS auto-converts --- to —
export const BLOCK_SEPARATOR = new RegExp(
  `\n(?:${HORIZONTAL_RULE}|${EM_DASH})\n`,
);
