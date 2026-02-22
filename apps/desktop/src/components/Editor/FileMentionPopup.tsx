import { File } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "@/i18n/I18nProvider";

interface FileMentionPopupProps {
  files: string[];
  query: string;
  onSelect: (filePath: string) => void;
  onClose: () => void;
}

const MAX_VISIBLE = 8;

/** Returns a match score (lower = better), or -1 if no match. */
function fuzzyScore(file: string, query: string): number {
  const basename = file.split("/").pop() ?? file;
  const lowerBase = basename.toLowerCase();
  const q = query.toLowerCase();

  // Exact basename match
  if (lowerBase === q) return 0;
  // Basename starts with query
  if (lowerBase.startsWith(q)) return 1;
  // Basename contains query as substring
  if (lowerBase.includes(q)) return 2;

  // Fuzzy match on basename
  let qi = 0;
  for (let i = 0; i < lowerBase.length && qi < q.length; i++) {
    if (lowerBase[i] === q[qi]) qi++;
  }
  if (qi === q.length) return 3;

  return -1;
}

export function FileMentionPopup({
  files,
  query,
  onSelect,
  onClose,
}: FileMentionPopupProps) {
  const { t } = useTranslation();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = query
    ? files
        .map((f) => ({ file: f, score: fuzzyScore(f, query) }))
        .filter((r) => r.score >= 0)
        .sort((a, b) => a.score - b.score)
        .map((r) => r.file)
    : files;

  // Reset selection when filtered results change
  // biome-ignore lint/correctness/useExhaustiveDependencies: reset index when filter changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Scroll selected item into view
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const item = list.children[selectedIndex] as HTMLElement | undefined;
    item?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          onSelect(filtered[selectedIndex]);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    },
    [filtered, selectedIndex, onSelect, onClose],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [handleKeyDown]);

  if (filtered.length === 0) {
    return (
      <div className="absolute z-50 w-72 left-0 top-full mt-1 rounded-md border border-border bg-popover p-2 text-sm text-muted-foreground shadow-md">
        {t("editor.no_files_found")}
      </div>
    );
  }

  return (
    <div className="absolute z-50 w-80 left-0 top-full mt-1 rounded-md border border-border bg-popover shadow-md">
      <div
        ref={listRef}
        className="overflow-y-auto py-1"
        style={{ maxHeight: `${MAX_VISIBLE * 32}px` }}
      >
        {filtered.map((file, index) => (
          <button
            key={file}
            type="button"
            className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm transition-colors ${
              index === selectedIndex
                ? "bg-primary/10 text-primary"
                : "text-foreground hover:bg-muted"
            }`}
            onMouseEnter={() => setSelectedIndex(index)}
            onMouseDown={(e) => {
              e.preventDefault();
              onSelect(file);
            }}
          >
            <File className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span
              className="block truncate text-left"
              style={{ direction: "rtl" }}
            >
              {file}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
