import { join } from "@tauri-apps/api/path";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  deletePromptFile,
  ensureDir,
  fileExists,
  listMarkdownFiles,
  listTopicDirs,
  readPromptFile,
  removeDir,
  renameEntry,
  writePromptFile,
} from "@/lib/fs";
import {
  parseMarkdown,
  serializeMarkdown,
  titleToFileName,
} from "@/lib/markdown";
import type { Prompt, Topic } from "@/types/prompt";

export function usePrompts(promptDir: string) {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const selectedIdRef = useRef(selectedId);
  selectedIdRef.current = selectedId;

  const selectedPrompt = prompts.find((p) => p.id === selectedId) || null;

  const loadPrompts = useCallback(async () => {
    if (!promptDir) return;
    try {
      setLoading(true);
      const dir = promptDir;
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

      if (allPrompts.length > 0 && !selectedIdRef.current) {
        setSelectedId(allPrompts[0].id);
      }
    } catch (error) {
      console.error("Failed to load prompts:", error);
    } finally {
      setLoading(false);
    }
  }, [promptDir]);

  useEffect(() => {
    loadPrompts();
  }, [loadPrompts]);

  const createPrompt = useCallback(
    async (title: string, topicName: string) => {
      const topicPath = await join(promptDir, topicName);
      await ensureDir(topicPath);

      const baseName = titleToFileName(title).replace(/\.md$/, "");
      let fileName = `${baseName}.md`;
      let filePath = await join(topicPath, fileName);
      let finalTitle = title;
      let counter = 1;

      while (await fileExists(filePath)) {
        fileName = `${baseName}-${counter}.md`;
        filePath = await join(topicPath, fileName);
        finalTitle = `${title} (${counter})`;
        counter++;
      }

      const now = new Date().toISOString();

      const prompt: Prompt = {
        id: filePath,
        title: finalTitle,
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
            t.name === topicName ? { ...t, promptCount: t.promptCount + 1 } : t,
          );
        }
        return [...prev, { name: topicName, path: topicPath, promptCount: 1 }];
      });
      setSelectedId(filePath);

      return prompt;
    },
    [promptDir],
  );

  const updatePrompt = useCallback(async (updated: Prompt) => {
    const withTimestamp = {
      ...updated,
      updated: new Date().toISOString(),
    };

    // Derive new filename from current title
    const newFileName = titleToFileName(withTimestamp.title);
    const oldFilePath = updated.filePath;
    const dir = oldFilePath.substring(0, oldFilePath.lastIndexOf("/"));
    const oldFileName = oldFilePath.split("/").pop() || "";

    let finalPrompt = withTimestamp;

    // Rename file if title-derived filename differs and is valid
    if (newFileName !== oldFileName && newFileName !== ".md") {
      let newFilePath = await join(dir, newFileName);
      let counter = 1;

      // Handle filename collisions (skip self — same path means no conflict)
      while ((await fileExists(newFilePath)) && newFilePath !== oldFilePath) {
        const base = newFileName.replace(/\.md$/, "");
        newFilePath = await join(dir, `${base}-${counter}.md`);
        counter++;
      }

      // Only rename if the path actually changed
      if (newFilePath !== oldFilePath) {
        await renameEntry(oldFilePath, newFilePath);
        finalPrompt = {
          ...withTimestamp,
          id: newFilePath,
          filePath: newFilePath,
        };
      }
    }

    const content = serializeMarkdown(finalPrompt);
    await writePromptFile(finalPrompt.filePath, content);

    setPrompts((prev) =>
      prev.map((p) => (p.id === updated.id ? finalPrompt : p)),
    );

    // Update selectedId if the renamed prompt was selected
    setSelectedId((prev) => (prev === updated.id ? finalPrompt.id : prev));
  }, []);

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
            : t,
        ),
      );

      if (selectedId === promptId) {
        const remaining = prompts.filter((p) => p.id !== promptId);
        setSelectedId(remaining.length > 0 ? remaining[0].id : null);
      }
    },
    [prompts, selectedId],
  );

  const createTopic = useCallback(
    async (name: string) => {
      const topicPath = await join(promptDir, name);
      await ensureDir(topicPath);
      setTopics((prev) => [...prev, { name, path: topicPath, promptCount: 0 }]);
    },
    [promptDir],
  );

  const renameTopic = useCallback(
    async (oldName: string, newName: string) => {
      const oldPath = await join(promptDir, oldName);
      const newPath = await join(promptDir, newName);
      await renameEntry(oldPath, newPath);

      setTopics((prev) =>
        prev.map((t) =>
          t.name === oldName ? { ...t, name: newName, path: newPath } : t,
        ),
      );

      setPrompts((prev) =>
        prev.map((p) => {
          if (p.topic !== oldName) return p;
          const newFilePath = p.filePath.replace(
            `/${oldName}/`,
            `/${newName}/`,
          );
          return {
            ...p,
            topic: newName,
            id: newFilePath,
            filePath: newFilePath,
          };
        }),
      );

      // Update selectedId if it belonged to renamed topic
      setSelectedId((prev) => {
        if (prev?.includes(`/${oldName}/`)) {
          return prev.replace(`/${oldName}/`, `/${newName}/`);
        }
        return prev;
      });

      return newName;
    },
    [promptDir],
  );

  const deleteTopic = useCallback(
    async (name: string) => {
      const topicPath = await join(promptDir, name);
      await removeDir(topicPath);

      const deletedIds = new Set(
        prompts.filter((p) => p.topic === name).map((p) => p.id),
      );

      setTopics((prev) => prev.filter((t) => t.name !== name));
      setPrompts((prev) => prev.filter((p) => p.topic !== name));

      if (selectedId && deletedIds.has(selectedId)) {
        const remaining = prompts.filter((p) => !deletedIds.has(p.id));
        setSelectedId(remaining.length > 0 ? remaining[0].id : null);
      }
    },
    [promptDir, prompts, selectedId],
  );

  return {
    prompts,
    topics,
    selectedPrompt,
    selectedId,
    loading,
    setSelectedId,
    loadPrompts,
    createPrompt,
    updatePrompt,
    deletePrompt,
    createTopic,
    renameTopic,
    deleteTopic,
  };
}
