import { relaunch } from "@tauri-apps/plugin-process";
import { open } from "@tauri-apps/plugin-shell";
import { check } from "@tauri-apps/plugin-updater";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useTranslation } from "@/i18n/I18nProvider";

const INITIAL_DELAY_MS = 5_000;
const CHECK_INTERVAL_MS = 30 * 60 * 1_000;
const RELEASE_URL = "https://github.com/tkhwang/prompt-pad/releases/latest";

export function useAutoUpdate() {
  const { t } = useTranslation();
  const toastIdRef = useRef<string | number | undefined>(undefined);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    async function checkForUpdate() {
      try {
        const update = await check();
        if (!update) return;

        // Dismiss previous update toast if any
        if (toastIdRef.current !== undefined) {
          toast.dismiss(toastIdRef.current);
        }

        toastIdRef.current = toast(t("update.available_title"), {
          description: t("update.available_description", {
            version: update.version,
          }),
          duration: Number.POSITIVE_INFINITY,
          action: {
            label: t("update.install"),
            onClick: async () => {
              try {
                await update.downloadAndInstall();
                await relaunch();
              } catch (err) {
                console.error("Failed to install update:", err);
              }
            },
          },
          cancel: {
            label: t("update.see_changes"),
            onClick: () => {
              open(RELEASE_URL);
            },
          },
        });
      } catch (err) {
        console.error("Update check failed:", err);
      }
    }

    const timeoutId = setTimeout(() => {
      checkForUpdate();
      intervalId = setInterval(checkForUpdate, CHECK_INTERVAL_MS);
    }, INITIAL_DELAY_MS);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [t]);
}
