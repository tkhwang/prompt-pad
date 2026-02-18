export const AUTO_SAVE_DELAY_MS = 800;
export const COPIED_STATE_TIMEOUT_MS = 1500;

export const UPDATE_INITIAL_DELAY_MS = 5_000;
export const UPDATE_CHECK_INTERVAL_MS = 30 * 60 * 1_000;
export const RELEASE_URL =
  "https://github.com/tkhwang/prompt-pad/releases/latest";

export const HORIZONTAL_RULE = "---";
export const EM_DASH = "—"; // macOS auto-converts --- to —
export const BLOCK_SEPARATOR = new RegExp(
  `\n(?:${HORIZONTAL_RULE}|${EM_DASH})\n`,
);
