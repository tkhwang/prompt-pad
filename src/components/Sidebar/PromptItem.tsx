import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTranslation } from "@/i18n/I18nProvider";
import { cn } from "@/lib/utils";
import type { Prompt } from "@/types/prompt";

interface PromptItemProps {
  prompt: Prompt;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
}

export function PromptItem({
  prompt,
  isSelected,
  onClick,
  onDelete,
}: PromptItemProps) {
  const { t } = useTranslation();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const preview = prompt.body.slice(0, 80).replace(/\n/g, " ");

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        onContextMenu={(e) => {
          e.preventDefault();
          setShowDeleteDialog(true);
        }}
        className={cn(
          "w-full text-left px-4 py-2.5 border-b transition-colors",
          "hover:bg-accent",
          isSelected && "bg-accent",
        )}
      >
        <div className="font-medium text-sm truncate">{prompt.title}</div>
        {preview && (
          <div className="text-xs text-muted-foreground truncate mt-0.5">
            {preview}
          </div>
        )}
      </button>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("prompt.delete_confirm", { title: prompt.title })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("prompt.delete_description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("prompt.delete_cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("prompt.delete_action")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
