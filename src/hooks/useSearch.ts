import { useMemo, useState } from "react";
import type { Prompt } from "@/types/prompt";

export function useSearch(prompts: Prompt[]) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return prompts;
    const lower = query.toLowerCase();
    return prompts.filter(
      (p) =>
        p.title.toLowerCase().includes(lower) ||
        p.body.toLowerCase().includes(lower)
    );
  }, [prompts, query]);

  return { query, setQuery, filtered };
}
