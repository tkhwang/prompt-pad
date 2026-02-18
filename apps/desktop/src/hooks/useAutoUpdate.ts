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
  const tRef = useRef(t);
  const toastIdRef = useRef<string | number | undefined>(undefined);

  // Keep ref in sync without restarting the effect
  useEffect(() => {
    tRef.current = t;
  });

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    async function checkForUpdate() {
      try {
        const update = await check();
        if (!update) return;

        const translate = tRef.current;

        // Dismiss previous update toast if any
        if (toastIdRef.current !== undefined) {
          toast.dismiss(toastIdRef.current);
        }

        toastIdRef.current = toast(translate("update.available_title"), {
          description: translate("update.available_description", {
            version: update.version,
          }),
          duration: Number.POSITIVE_INFINITY,
          action: {
            label: translate("update.install"),
            onClick: async () => {
              const t = tRef.current;
              const installingId = toast.loading(t("update.installing"), {
                duration: Number.POSITIVE_INFINITY,
              });
              try {
                await update.downloadAndInstall();
                toast.dismiss(installingId);
                await relaunch();
              } catch (err) {
                console.error("Failed to install update:", err);
                toast.dismiss(installingId);
                toast.error(t("update.install_failed"));
              }
            },
          },
          cancel: {
            label: translate("update.see_changes"),
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
  }, []);
}
