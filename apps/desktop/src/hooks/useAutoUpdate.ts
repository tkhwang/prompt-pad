import { relaunch } from "@tauri-apps/plugin-process";
import { open } from "@tauri-apps/plugin-shell";
import { check } from "@tauri-apps/plugin-updater";
import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  RELEASE_URL,
  UPDATE_CHECK_INTERVAL_MS,
  UPDATE_INITIAL_DELAY_MS,
} from "@/consts";
import { useTranslation } from "@/i18n/I18nProvider";

export function useAutoUpdate() {
  const { t } = useTranslation();
  const tRef = useRef(t);
  const toastIdRef = useRef<string | number | undefined>(undefined);

  // Keep ref in sync without restarting the effect
  useEffect(() => {
    tRef.current = t;
  });

  const handleUpdate = useCallback(async (manual: boolean) => {
    const translate = tRef.current;

    if (manual) {
      toast.loading(translate("update.checking"), { id: "update-check" });
    }

    try {
      const update = await check();

      if (!update) {
        if (manual) {
          toast.success(translate("update.up_to_date"), { id: "update-check" });
        }
        return;
      }

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
            const translate = tRef.current;
            const installingId = toast.loading(translate("update.installing"), {
              duration: Number.POSITIVE_INFINITY,
            });
            try {
              await update.downloadAndInstall();
              toast.dismiss(installingId);
              await relaunch();
            } catch (err) {
              console.error("Failed to install update:", err);
              toast.dismiss(installingId);
              toast.error(translate("update.install_failed"), {
                duration: Number.POSITIVE_INFINITY,
                action: {
                  label: translate("update.download_manually"),
                  onClick: () => {
                    open(RELEASE_URL);
                  },
                },
              });
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
      if (manual) {
        toast.error(translate("update.install_failed"), { id: "update-check" });
      }
    }
  }, []);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    const timeoutId = setTimeout(() => {
      handleUpdate(false);
      intervalId = setInterval(
        () => handleUpdate(false),
        UPDATE_CHECK_INTERVAL_MS,
      );
    }, UPDATE_INITIAL_DELAY_MS);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [handleUpdate]);

  const checkNow = useCallback(() => handleUpdate(true), [handleUpdate]);

  return { checkNow };
}
