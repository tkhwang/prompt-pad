import type { LucideIcon } from "lucide-react";
import {
  Bold,
  Code,
  Heading,
  Italic,
  List,
  ListOrdered,
  Quote,
  Strikethrough,
} from "lucide-react";
import type { RefObject } from "react";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface MarkdownToolbarProps {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  onTextChange: (newBody: string) => void;
}

type FormatAction = {
  icon: LucideIcon;
  label: string;
  apply: (
    text: string,
    start: number,
    end: number,
  ) => { newText: string; cursorStart: number; cursorEnd: number };
};

function wrapSelection(
  text: string,
  start: number,
  end: number,
  prefix: string,
  suffix: string,
) {
  const selected = text.slice(start, end);
  const newText =
    text.slice(0, start) + prefix + selected + suffix + text.slice(end);
  return {
    newText,
    cursorStart: start + prefix.length,
    cursorEnd: end + prefix.length,
  };
}

function prependLine(text: string, start: number, end: number, prefix: string) {
  const lineStart = text.lastIndexOf("\n", start - 1) + 1;
  const lineEnd = text.indexOf("\n", end);
  const block = text.slice(lineStart, lineEnd === -1 ? undefined : lineEnd);
  const prefixed = block
    .split("\n")
    .map((line) => (line ? prefix + line : line))
    .join("\n");
  const newText =
    text.slice(0, lineStart) +
    prefixed +
    (lineEnd === -1 ? "" : text.slice(lineEnd));
  const addedCount = block.split("\n").filter((line) => line.length > 0).length;
  return {
    newText,
    cursorStart: start + prefix.length,
    cursorEnd: end + prefix.length * addedCount,
  };
}

const ACTIONS: FormatAction[] = [
  {
    icon: Heading,
    label: "Heading",
    apply: (text, start, end) => prependLine(text, start, end, "## "),
  },
  {
    icon: Bold,
    label: "Bold",
    apply: (text, start, end) => wrapSelection(text, start, end, "**", "**"),
  },
  {
    icon: Italic,
    label: "Italic",
    apply: (text, start, end) => wrapSelection(text, start, end, "*", "*"),
  },
  {
    icon: Strikethrough,
    label: "Strikethrough",
    apply: (text, start, end) => wrapSelection(text, start, end, "~~", "~~"),
  },
];

const LIST_ACTIONS: FormatAction[] = [
  {
    icon: List,
    label: "Bullet List",
    apply: (text, start, end) => prependLine(text, start, end, "- "),
  },
  {
    icon: ListOrdered,
    label: "Ordered List",
    apply: (text, start, end) => prependLine(text, start, end, "1. "),
  },
];

const BLOCK_ACTIONS: FormatAction[] = [
  {
    icon: Quote,
    label: "Quote",
    apply: (text, start, end) => prependLine(text, start, end, "> "),
  },
  {
    icon: Code,
    label: "Code",
    apply: (text, start, end) => {
      const selected = text.slice(start, end);
      if (selected.includes("\n")) {
        return wrapSelection(text, start, end, "```\n", "\n```");
      }
      return wrapSelection(text, start, end, "`", "`");
    },
  },
];

function ToolbarButton({
  action,
  onClick,
}: {
  action: FormatAction;
  onClick: () => void;
}) {
  const Icon = action.icon;
  return (
    <Button
      variant="ghost"
      size="icon-xs"
      className="text-foreground/60 hover:text-foreground"
      onClick={onClick}
      title={action.label}
    >
      <Icon className="h-3.5 w-3.5" />
    </Button>
  );
}

export function MarkdownToolbar({
  textareaRef,
  onTextChange,
}: MarkdownToolbarProps) {
  const handleAction = useCallback(
    (action: FormatAction) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const { value, selectionStart, selectionEnd } = textarea;
      const { newText, cursorStart, cursorEnd } = action.apply(
        value,
        selectionStart,
        selectionEnd,
      );

      onTextChange(newText);

      requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(cursorStart, cursorEnd);
      });
    },
    [textareaRef, onTextChange],
  );

  return (
    <div className="flex items-center gap-0.5 px-5 py-1.5 border-b border-border/60">
      {ACTIONS.map((action) => (
        <ToolbarButton
          key={action.label}
          action={action}
          onClick={() => handleAction(action)}
        />
      ))}
      <Separator orientation="vertical" className="mx-1.5 h-4" />
      {LIST_ACTIONS.map((action) => (
        <ToolbarButton
          key={action.label}
          action={action}
          onClick={() => handleAction(action)}
        />
      ))}
      <Separator orientation="vertical" className="mx-1.5 h-4" />
      {BLOCK_ACTIONS.map((action) => (
        <ToolbarButton
          key={action.label}
          action={action}
          onClick={() => handleAction(action)}
        />
      ))}
    </div>
  );
}
