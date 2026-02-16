import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { Check, Copy, Eye, Pencil } from "lucide-react";
import {
  type Ref,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Editor } from "@/components/Editor/Editor";
import { TemplatePanel } from "@/components/Editor/TemplatePanel";
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
  const [templateCopied, setTemplateCopied] = useState(false);

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

  const handleCopyWithVariables = useCallback(async () => {
    if (!prompt) return;
    const result = substituteVariables(prompt.body, templateValues);
    await writeText(result);
    setTemplateCopied(true);
    setTimeout(() => setTemplateCopied(false), 2000);
  }, [prompt, templateValues]);

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
  const isCopied = hasVariables ? templateCopied : copied;
  const handleCopy = hasVariables ? handleCopyWithVariables : onCopy;
  const copyLabel = isCopied
    ? t("editor.copied")
    : t(hasVariables ? "template.copy" : "editor.copy");

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

      {/* Main content: Editor + Copy (left) | TemplatePanel (right) */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Editor + Copy button */}
        <div className="flex flex-1 flex-col min-w-0">
          {editorMode === "edit" ? (
            <Editor prompt={prompt} onUpdate={onUpdate} bodyRef={bodyRef} />
          ) : (
            <ScrollArea className="flex-1 px-5 py-4">
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
          <div className="px-5 py-3 border-t border-border/40">
            <Button
              variant="outline"
              className="w-full shadow-none hover:bg-primary hover:text-primary-foreground transition-all duration-200"
              onClick={handleCopy}
            >
              {isCopied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copyLabel}
            </Button>
          </div>
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
