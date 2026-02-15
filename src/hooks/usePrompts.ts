import { useState, useEffect, useCallback } from "react";
import type { Prompt, Topic } from "@/types/prompt";
import {
  getDefaultPromptDir,
  ensureDir,
  listTopicDirs,
  listMarkdownFiles,
  readPromptFile,
  writePromptFile,
  deletePromptFile,
} from "@/lib/fs";
import {
  parseMarkdown,
  serializeMarkdown,
  titleToFileName,
} from "@/lib/markdown";
import { join } from "@tauri-apps/api/path";

export function usePrompts() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rootDir, setRootDir] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const selectedPrompt = prompts.find((p) => p.id === selectedId) || null;

  const loadPrompts = useCallback(async () => {
    try {
      setLoading(true);
      const dir = await getDefaultPromptDir();
      setRootDir(dir);
      await ensureDir(dir);

      const topicNames = await listTopicDirs(dir);
      const allPrompts: Prompt[] = [];
      const allTopics: Topic[] = [];

      for (const topicName of topicNames) {
        const topicPath = await join(dir, topicName);
        const files = await listMarkdownFiles(topicPath);

        for (const fileName of files) {
          const filePath = await join(topicPath, fileName);
          const content = await readPromptFile(filePath);
          const prompt = parseMarkdown(content, filePath, topicName);
          allPrompts.push(prompt);
        }

        allTopics.push({
          name: topicName,
          path: topicPath,
          promptCount: files.length,
        });
      }

      setPrompts(allPrompts);
      setTopics(allTopics);

      if (allPrompts.length > 0 && !selectedId) {
        setSelectedId(allPrompts[0].id);
      }
    } catch (error) {
      console.error("Failed to load prompts:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedId]);

  useEffect(() => {
    loadPrompts();
  }, []);

  const createPrompt = useCallback(
    async (title: string, topicName: string) => {
      const topicPath = await join(rootDir, topicName);
      await ensureDir(topicPath);

      const fileName = titleToFileName(title);
      const filePath = await join(topicPath, fileName);
      const now = new Date().toISOString();

      const prompt: Prompt = {
        id: filePath,
        title,
        body: "",
        topic: topicName,
        tags: [],
        filePath,
        created: now,
        updated: now,
      };

      const content = serializeMarkdown(prompt);
      await writePromptFile(filePath, content);

      setPrompts((prev) => [...prev, prompt]);
      setTopics((prev) => {
        const existing = prev.find((t) => t.name === topicName);
        if (existing) {
          return prev.map((t) =>
            t.name === topicName
              ? { ...t, promptCount: t.promptCount + 1 }
              : t
          );
        }
        return [...prev, { name: topicName, path: topicPath, promptCount: 1 }];
      });
      setSelectedId(filePath);

      return prompt;
    },
    [rootDir]
  );

  const updatePrompt = useCallback(
    async (updated: Prompt) => {
      const withTimestamp = {
        ...updated,
        updated: new Date().toISOString(),
      };
      const content = serializeMarkdown(withTimestamp);
      await writePromptFile(updated.filePath, content);

      setPrompts((prev) =>
        prev.map((p) => (p.id === updated.id ? withTimestamp : p))
      );
    },
    []
  );

  const deletePrompt = useCallback(
    async (promptId: string) => {
      const prompt = prompts.find((p) => p.id === promptId);
      if (!prompt) return;

      await deletePromptFile(prompt.filePath);

      setPrompts((prev) => prev.filter((p) => p.id !== promptId));
      setTopics((prev) =>
        prev.map((t) =>
          t.name === prompt.topic
            ? { ...t, promptCount: t.promptCount - 1 }
            : t
        )
      );

      if (selectedId === promptId) {
        const remaining = prompts.filter((p) => p.id !== promptId);
        setSelectedId(remaining.length > 0 ? remaining[0].id : null);
      }
    },
    [prompts, selectedId]
  );

  return {
    prompts,
    topics,
    selectedPrompt,
    selectedId,
    loading,
    rootDir,
    setSelectedId,
    loadPrompts,
    createPrompt,
    updatePrompt,
    deletePrompt,
  };
}
