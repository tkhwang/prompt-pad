import { Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/i18n/I18nProvider";
import { extractVariables } from "@/lib/template";
import { cn } from "@/lib/utils";
import type { Prompt } from "@/types/prompt";

interface PromptItemProps {
  prompt: Prompt;
  isSelected: boolean;
  viewMode: "simple" | "detail";
  onClick: () => void;
  onDelete: () => void;
}

export function PromptItem({
  prompt,
  isSelected,
  viewMode,
  onClick,
  onDelete,
}: PromptItemProps) {
  const { t } = useTranslation();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const preview = prompt.body.slice(0, 80).replace(/\n/g, " ");
  const variables = useMemo(() => extractVariables(prompt.body), [prompt.body]);

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
          "w-full text-left px-4 py-2.5 transition-all duration-150 border-l-2",
          "hover:bg-accent/60",
          isSelected
            ? "bg-accent border-l-primary pl-[14px]"
            : "border-l-transparent",
        )}
      >
        <div className="flex items-center gap-1 min-w-0">
          <span className="font-medium text-sm truncate">{prompt.title}</span>
          {variables.length > 0 && (
            <span className="shrink-0 flex items-center gap-0.5 text-muted-foreground">
              <Sparkles className="h-3 w-3" />
              <span className="text-[10px]">{variables.length}</span>
            </span>
          )}
        </div>
        {viewMode === "detail" && preview && (
          <div className="text-xs text-muted-foreground truncate mt-0.5">
            {preview}
          </div>
        )}
        {viewMode === "detail" && prompt.tags.length > 0 && (
          <div className="flex items-center gap-1 mt-1 overflow-hidden">
            {prompt.tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                className="text-[10px] px-1.5 py-0 h-4 shrink-0 bg-primary/15 text-primary border-transparent"
              >
                {tag}
              </Badge>
            ))}
            {prompt.tags.length > 3 && (
              <span className="text-[10px] text-muted-foreground shrink-0">
                +{prompt.tags.length - 3}
              </span>
            )}
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
