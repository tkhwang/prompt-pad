import { join } from "@tauri-apps/api/path";
import {
  exists,
  mkdir,
  readDir,
  readTextFile,
  remove,
  rename,
  writeTextFile,
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

export async function writePromptFile(
  filePath: string,
  content: string,
): Promise<void> {
  await writeTextFile(filePath, content);
}

export async function deletePromptFile(filePath: string): Promise<void> {
  await remove(filePath);
}

export async function fileExists(path: string): Promise<boolean> {
  return await exists(path);
}

export async function removeDir(path: string): Promise<void> {
  await remove(path, { recursive: true });
}

export async function renameEntry(
  oldPath: string,
  newPath: string,
): Promise<void> {
  await rename(oldPath, newPath);
}

export async function findAvailablePath(
  directory: string,
  baseName: string,
  options?: { excludePath?: string },
): Promise<{ filePath: string; counter: number }> {
  let counter = 0;

  while (true) {
    const fileName =
      counter === 0 ? `${baseName}.md` : `${baseName}-${counter}.md`;
    const filePath = await join(directory, fileName);
    const isExcluded = options?.excludePath === filePath;

    if (isExcluded || !(await fileExists(filePath))) {
      return { filePath, counter };
    }

    counter++;
  }
}
