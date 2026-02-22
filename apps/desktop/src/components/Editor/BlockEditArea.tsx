import { Trash2 } from "lucide-react";
import {
  type ChangeEvent,
  forwardRef,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { useTranslation } from "@/i18n/I18nProvider";

interface BlockEditAreaProps {
  value: string;
  onChange: (value: string) => void;
  onFocus: () => void;
  onDelete?: () => void;
  onSplit?: (before: string, after: string) => void;
  isActive: boolean;
}

export const BlockEditArea = forwardRef<
  HTMLTextAreaElement,
  BlockEditAreaProps
>(function BlockEditArea(
  { value, onChange, onFocus, onDelete, onSplit, isActive },
  ref,
) {
  const { t } = useTranslation();
  const internalRef = useRef<HTMLTextAreaElement | null>(null);

  const setRef = useCallback(
    (el: HTMLTextAreaElement | null) => {
      internalRef.current = el;
      if (typeof ref === "function") ref(el);
      else if (ref)
        (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current =
          el;
    },
    [ref],
  );

  const autoResize = useCallback(() => {
    const el = internalRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: value triggers resize when text content changes
  useEffect(() => {
    autoResize();
  }, [value, autoResize]);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);
    },
    [onChange],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key !== "Enter" || !onSplit) return;
      const el = internalRef.current;
      if (!el) return;

      const { value: text, selectionStart } = el;
      // Find the start of the current line
      const lineStart = text.lastIndexOf("\n", selectionStart - 1) + 1;
      const lineBeforeCursor = text.slice(lineStart, selectionStart);

      // Check if the line before cursor is exactly "---" or "—"
      if (lineBeforeCursor === "---" || lineBeforeCursor === "\u2014") {
        e.preventDefault();
        const before = text.slice(0, lineStart).replace(/\n$/, "");
        const after = text.slice(selectionStart).replace(/^\n/, "");
        onSplit(before, after);
      }
    },
    [onSplit],
  );

  return (
    <div
      className={`group relative rounded-md transition-colors ${
        isActive
          ? "ring-1 ring-primary/30 bg-primary/[0.02]"
          : "hover:bg-muted/30"
      }`}
    >
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className={`absolute top-2 right-2 z-10 p-1 rounded transition-opacity ${isActive ? "opacity-70" : "opacity-0 group-hover:opacity-100"} text-muted-foreground hover:text-destructive hover:bg-destructive/10`}
          title={t("editor.delete_block")}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
      <textarea
        ref={setRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        className="w-full resize-none bg-transparent outline-none leading-relaxed text-foreground caret-primary placeholder:text-muted-foreground/40 p-4"
        style={{
          fontFamily: "var(--editor-font)",
          fontSize: "var(--editor-font-size)",
          overflow: "hidden",
        }}
        placeholder={t("editor.placeholder_body")}
        rows={1}
      />
    </div>
  );
});
