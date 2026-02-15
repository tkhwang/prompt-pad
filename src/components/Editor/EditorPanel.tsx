import { Check, Copy, Eye, Pencil } from "lucide-react";
import type { Ref } from "react";
import { Editor } from "@/components/Editor/Editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "@/i18n/I18nProvider";
import type { Prompt } from "@/types/prompt";

interface EditorPanelProps {
  prompt: Prompt | null;
  editorMode: "view" | "edit";
  onEditorModeChange: (mode: "view" | "edit") => void;
  onUpdate: (updated: Prompt) => void;
  onCopy: () => void;
  copied: boolean;
  titleRef?: Ref<HTMLInputElement>;
  bodyRef?: Ref<HTMLTextAreaElement>;
  onTitleEnter?: () => void;
}

export function EditorPanel({
  prompt,
  editorMode,
  onEditorModeChange,
  onUpdate,
  onCopy,
  copied,
  titleRef,
  bodyRef,
  onTitleEnter,
}: EditorPanelProps) {
  const { t } = useTranslation();

  if (!prompt) {
    return (
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          {t("editor.empty")}
        </div>
      </div>
    );
  }

  const toggleMode = () =>
    onEditorModeChange(editorMode === "view" ? "edit" : "view");

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Title + mode toggle row */}
      <div className="flex items-center px-4 py-3 border-b gap-2">
        <div className="flex-1 min-w-0 h-9 flex items-center">
          {editorMode === "edit" ? (
            <Input
              ref={titleRef}
              value={prompt.title}
              onChange={(e) => onUpdate({ ...prompt, title: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onTitleEnter?.();
                }
              }}
              className="h-full w-full text-lg md:text-lg font-semibold border-none p-0 shadow-none focus-visible:ring-0"
              placeholder={t("editor.placeholder_title")}
            />
          ) : (
            <h2 className="text-lg font-semibold truncate">{prompt.title}</h2>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={toggleMode}>
          {editorMode === "view" ? (
            <Eye className="h-4 w-4" />
          ) : (
            <Pencil className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Editor or read-only view */}
      {editorMode === "edit" ? (
        <Editor prompt={prompt} onUpdate={onUpdate} bodyRef={bodyRef} />
      ) : (
        <ScrollArea className="flex-1 p-4">
          <pre
            className="whitespace-pre-wrap leading-relaxed"
            style={{
              fontFamily: "var(--editor-font)",
              fontSize: "var(--editor-font-size)",
            }}
          >
            {prompt.body}
          </pre>
        </ScrollArea>
      )}

      {/* Bottom Copy button */}
      <div className="px-4 py-3 border-t">
        <Button className="w-full" onClick={onCopy}>
          {copied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          {copied ? t("editor.copied") : t("editor.copy")}
        </Button>
      </div>
    </div>
  );
}
