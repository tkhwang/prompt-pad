import { invoke } from "@tauri-apps/api/core";

export type DistributionChannel = "direct" | "mas";

let cached: DistributionChannel | null = null;

export async function getDistributionChannel(): Promise<DistributionChannel> {
  if (!cached) {
    cached = await invoke<DistributionChannel>("get_distribution_channel");
  }
  return cached;
}
