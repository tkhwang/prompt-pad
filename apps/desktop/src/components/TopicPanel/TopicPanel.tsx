import { FolderOpen, Layers, Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useRef, useState } from "react";
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
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "@/i18n/I18nProvider";
import { cn } from "@/lib/utils";
import type { Topic } from "@/types/prompt";

interface TopicPanelProps {
  topics: Topic[];
  totalPromptCount: number;
  selectedTopic: string | null;
  onSelectTopic: (topic: string | null) => void;
  onCreateTopic: (name: string) => void;
  onRenameTopic: (oldName: string, newName: string) => void;
  onDeleteTopic: (name: string) => void;
}

export function TopicPanel({
  topics,
  totalPromptCount,
  selectedTopic,
  onSelectTopic,
  onCreateTopic,
  onRenameTopic,
  onDeleteTopic,
}: TopicPanelProps) {
  const { t } = useTranslation();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [renamingTopic, setRenamingTopic] = useState<string | null>(null);
  const [deletingTopic, setDeletingTopic] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCreateSubmit = useCallback(() => {
    const name = inputValue.trim();
    if (name) {
      onCreateTopic(name);
      setInputValue("");
      setShowCreateDialog(false);
    }
  }, [inputValue, onCreateTopic]);

  const handleRenameSubmit = useCallback(() => {
    const newName = inputValue.trim();
    if (newName && renamingTopic && newName !== renamingTopic) {
      onRenameTopic(renamingTopic, newName);
    }
    setInputValue("");
    setRenamingTopic(null);
  }, [inputValue, renamingTopic, onRenameTopic]);

  const handleDeleteConfirm = useCallback(() => {
    if (deletingTopic) {
      onDeleteTopic(deletingTopic);
      setDeletingTopic(null);
    }
  }, [deletingTopic, onDeleteTopic]);

  return (
    <div className="flex flex-col h-full w-48 bg-sidebar">
      <button
        type="button"
        onClick={() => onSelectTopic(null)}
        className={cn(
          "flex items-center gap-2 mx-1.5 my-0.5 px-2.5 py-2 text-sm rounded-md transition-colors",
          "hover:bg-sidebar-accent",
          selectedTopic === null &&
            "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
        )}
      >
        <Layers className="h-4 w-4 shrink-0" />
        <span className="truncate">{t("topic_panel.all_prompts")}</span>
        <span className="ml-auto text-xs text-muted-foreground">
          {totalPromptCount}
        </span>
      </button>
      <ScrollArea className="flex-1">
        {topics.map((topic) => (
          <ContextMenu key={topic.name}>
            <ContextMenuTrigger asChild>
              <button
                type="button"
                onClick={() => onSelectTopic(topic.name)}
                className={cn(
                  "flex items-center gap-2 w-full mx-1.5 my-0.5 px-2.5 py-2 text-sm rounded-md transition-colors",
                  "hover:bg-sidebar-accent",
                  selectedTopic === topic.name &&
                    "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
                )}
              >
                <FolderOpen className="h-4 w-4 shrink-0" />
                <span className="truncate">{topic.name}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {topic.promptCount}
                </span>
              </button>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem
                onClick={() => {
                  setInputValue(topic.name);
                  setRenamingTopic(topic.name);
                }}
              >
                <Pencil className="h-4 w-4 mr-2" />
                {t("topic_panel.rename")}
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => setDeletingTopic(topic.name)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t("topic_panel.delete")}
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        ))}
      </ScrollArea>

      {/* Create topic button */}
      <div className="p-1.5">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-muted-foreground"
          onClick={() => {
            setInputValue("");
            setShowCreateDialog(true);
          }}
        >
          <Plus className="h-4 w-4" />
          {t("topic_panel.create")}
        </Button>
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>{t("topic_panel.create")}</DialogTitle>
          </DialogHeader>
          <Input
            ref={inputRef}
            placeholder={t("topic_panel.create_placeholder")}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreateSubmit();
            }}
            autoFocus
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t("topic_panel.cancel")}</Button>
            </DialogClose>
            <Button onClick={handleCreateSubmit} disabled={!inputValue.trim()}>
              {t("topic_panel.create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog
        open={renamingTopic !== null}
        onOpenChange={(open) => {
          if (!open) {
            setRenamingTopic(null);
            setInputValue("");
          }
        }}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>{t("topic_panel.rename")}</DialogTitle>
          </DialogHeader>
          <Input
            placeholder={t("topic_panel.create_placeholder")}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRenameSubmit();
            }}
            autoFocus
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t("topic_panel.cancel")}</Button>
            </DialogClose>
            <Button
              onClick={handleRenameSubmit}
              disabled={
                !inputValue.trim() || inputValue.trim() === renamingTopic
              }
            >
              {t("topic_panel.rename")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete AlertDialog */}
      <AlertDialog
        open={deletingTopic !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingTopic(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("topic_panel.delete_confirm", {
                name: deletingTopic ?? "",
              })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("topic_panel.delete_description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("topic_panel.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("topic_panel.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
