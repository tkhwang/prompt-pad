import { invoke } from "@tauri-apps/api/core";

export type DistributionChannel = "direct" | "mas";

let cached: Promise<DistributionChannel> | null = null;

export function getDistributionChannel(): Promise<DistributionChannel> {
  if (!cached) {
    cached = invoke<DistributionChannel>("get_distribution_channel");
  }
  return cached;
}
