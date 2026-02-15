import type { Prompt } from "@/types/prompt";
import { MetaBar } from "./MetaBar";
import { PromptEditor } from "./PromptEditor";

interface EditorProps {
  prompt: Prompt | null;
  topics: string[];
  onUpdate: (updated: Prompt) => void;
}

export function Editor({ prompt, topics, onUpdate }: EditorProps) {
  if (!prompt) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        Select a prompt or create a new one
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <MetaBar prompt={prompt} topics={topics} onUpdate={onUpdate} />
      <PromptEditor prompt={prompt} onUpdate={onUpdate} />
    </div>
  );
}
