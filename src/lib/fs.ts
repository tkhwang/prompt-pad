import {
  readDir,
  readTextFile,
  writeTextFile,
  mkdir,
  exists,
  remove,
  rename,
} from "@tauri-apps/plugin-fs";

export async function ensureDir(path: string): Promise<void> {
  if (!(await exists(path))) {
    await mkdir(path, { recursive: true });
  }
}

export async function listTopicDirs(rootDir: string): Promise<string[]> {
  await ensureDir(rootDir);
  const entries = await readDir(rootDir);
  return entries
    .filter((e) => e.isDirectory)
    .map((e) => e.name)
    .filter((name): name is string => name !== null);
}

export async function listMarkdownFiles(dirPath: string): Promise<string[]> {
  const entries = await readDir(dirPath);
  return entries
    .filter((e) => e.isFile && e.name?.endsWith(".md"))
    .map((e) => e.name)
    .filter((name): name is string => name !== null);
}

export async function readPromptFile(filePath: string): Promise<string> {
  return await readTextFile(filePath);
}

export async function writePromptFile(filePath: string, content: string): Promise<void> {
  await writeTextFile(filePath, content);
}

export async function deletePromptFile(filePath: string): Promise<void> {
  await remove(filePath);
}

export async function renameEntry(oldPath: string, newPath: string): Promise<void> {
  await rename(oldPath, newPath);
}
