import { join } from "@tauri-apps/api/path";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  deletePromptFile,
  ensureDir,
  findAvailablePath,
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

function replacePathPrefix(
  targetPath: string,
  fromPath: string,
  toPath: string,
): string {
  if (targetPath === fromPath) return toPath;

  const separator = fromPath.includes("\\") ? "\\" : "/";
  const fromWithBoundary = fromPath.endsWith(separator)
    ? fromPath
    : `${fromPath}${separator}`;

  if (!targetPath.startsWith(fromWithBoundary)) return targetPath;
  return `${toPath}${targetPath.slice(fromPath.length)}`;
}

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
      const { filePath, counter } = await findAvailablePath(
        topicPath,
        baseName,
      );
      const finalTitle = counter === 0 ? title : `${title} (${counter})`;

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
      const baseName = newFileName.replace(/\.md$/, "");
      const { filePath: newFilePath } = await findAvailablePath(dir, baseName, {
        excludePath: oldFilePath,
      });

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

      const remainingPrompts = prompts.filter((p) => p.id !== promptId);

      setPrompts(remainingPrompts);
      setTopics((prev) =>
        prev.map((t) =>
          t.name === prompt.topic
            ? { ...t, promptCount: t.promptCount - 1 }
            : t,
        ),
      );

      if (selectedId === promptId) {
        setSelectedId(
          remainingPrompts.length > 0 ? remainingPrompts[0].id : null,
        );
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
          const newFilePath = replacePathPrefix(p.filePath, oldPath, newPath);
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
        if (!prev) return prev;
        return replacePathPrefix(prev, oldPath, newPath);
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
      const remainingPrompts = prompts.filter((p) => p.topic !== name);

      setTopics((prev) => prev.filter((t) => t.name !== name));
      setPrompts(remainingPrompts);

      if (selectedId && deletedIds.has(selectedId)) {
        setSelectedId(
          remainingPrompts.length > 0 ? remainingPrompts[0].id : null,
        );
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
