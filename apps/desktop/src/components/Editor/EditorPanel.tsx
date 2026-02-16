import { Eye, Pencil, X } from "lucide-react";
import {
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Editor } from "@/components/Editor/Editor";
import { MarkdownPreview } from "@/components/Editor/MarkdownPreview";
import { TemplatePanel } from "@/components/Editor/TemplatePanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "@/i18n/I18nProvider";
import { extractVariables, substituteVariables } from "@/lib/template";
import type { Prompt } from "@/types/prompt";

interface EditorPanelProps {
  prompt: Prompt | null;
  editorMode: "view" | "edit";
  onEditorModeChange: (mode: "view" | "edit") => void;
  onUpdate: (updated: Prompt) => void;
  titleRef?: RefObject<HTMLInputElement | null>;
  bodyRef?: RefObject<HTMLTextAreaElement | null>;
  onTitleEnter?: () => void;
}

export function EditorPanel({
  prompt,
  editorMode,
  onEditorModeChange,
  onUpdate,
  titleRef,
  bodyRef,
  onTitleEnter,
}: EditorPanelProps) {
  const { t } = useTranslation();
  const body = prompt?.body ?? "";
  const variables = useMemo(() => extractVariables(body), [body]);
  const prevVariablesRef = useRef<string[]>(variables);

  // Sync prompt.templateValues when variables change
  useEffect(() => {
    if (!prompt) return;

    const prev = prevVariablesRef.current;
    const prevSet = new Set(prev);
    const currSet = new Set(variables);

    const changed =
      prev.length !== variables.length ||
      variables.some((v) => !prevSet.has(v)) ||
      prev.some((v) => !currSet.has(v));

    if (!changed) return;

    prevVariablesRef.current = variables;

    const currentValues = prompt.templateValues ?? {};
    const next: Record<string, string> = {};
    for (const v of variables) {
      next[v] = currentValues[v] ?? "";
    }

    onUpdate({ ...prompt, templateValues: next });
  }, [variables, prompt, onUpdate]);

  const templateValues = prompt?.templateValues ?? {};

  const handleTemplateValuesChange = useCallback(
    (values: Record<string, string>) => {
      if (!prompt) return;
      onUpdate({ ...prompt, templateValues: values });
    },
    [prompt, onUpdate],
  );

  const [tagInput, setTagInput] = useState("");

  const handleAddTag = useCallback(
    (value: string) => {
      const tag = value.trim();
      if (!prompt || !tag) return;
      if (prompt.tags.includes(tag)) {
        setTagInput("");
        return;
      }
      onUpdate({ ...prompt, tags: [...prompt.tags, tag] });
      setTagInput("");
    },
    [prompt, onUpdate],
  );

  const handleRemoveTag = useCallback(
    (tag: string) => {
      if (!prompt) return;
      onUpdate({ ...prompt, tags: prompt.tags.filter((t) => t !== tag) });
    },
    [prompt, onUpdate],
  );

  if (!prompt) {
    return (
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          {t("editor.empty")}
        </div>
      </div>
    );
  }

  const hasVariables = variables.length > 0;

  const toggleMode = () =>
    onEditorModeChange(editorMode === "view" ? "edit" : "view");

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Title + mode toggle row */}
      <div className="flex items-center px-5 py-3 border-b border-border/40 gap-2">
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

      {/* Tags row */}
      {(prompt.tags.length > 0 || editorMode === "edit") && (
        <div className="flex items-center gap-1.5 px-5 py-1.5 border-b border-border/40 flex-wrap">
          {prompt.tags.map((tag) => (
            <Badge
              key={tag}
              className="text-xs gap-1 pr-1 bg-primary/15 text-primary border-transparent"
            >
              {tag}
              {editorMode === "edit" && (
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-0.5 hover:text-destructive transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          ))}
          {editorMode === "edit" && (
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTag(tagInput);
                } else if (
                  e.key === "Backspace" &&
                  !tagInput &&
                  prompt.tags.length > 0
                ) {
                  handleRemoveTag(prompt.tags[prompt.tags.length - 1]);
                }
              }}
              onBlur={() => handleAddTag(tagInput)}
              placeholder={t("editor.tag_placeholder")}
              className="text-xs bg-transparent outline-none min-w-[80px] flex-1 text-muted-foreground placeholder:text-muted-foreground/50"
            />
          )}
        </div>
      )}

      {/* Main content: Editor (left) | TemplatePanel (right) */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Editor */}
        <div
          className={`flex flex-1 flex-col min-w-0 ${editorMode === "view" ? "bg-muted/50" : ""}`}
        >
          {editorMode === "edit" ? (
            <Editor prompt={prompt} onUpdate={onUpdate} bodyRef={bodyRef} />
          ) : (
            <ScrollArea className="flex-1 min-h-0 px-5 py-4">
              <MarkdownPreview
                content={
                  hasVariables
                    ? substituteVariables(prompt.body, templateValues)
                    : prompt.body
                }
              />
            </ScrollArea>
          )}
        </div>

        {/* Right: Template variables panel */}
        {hasVariables && (
          <TemplatePanel
            variables={variables}
            values={templateValues}
            onChange={handleTemplateValuesChange}
            editorMode={editorMode}
          />
        )}
      </div>
    </div>
  );
}
