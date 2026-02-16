import { dump, load } from "js-yaml";
import type { Prompt } from "@/types/prompt";

interface Frontmatter {
  title: string;
  created: string;
  updated: string;
  tags: string[];
  templateValues?: Record<string, string>;
}

export function parseMarkdown(
  content: string,
  filePath: string,
  topic: string,
): Prompt {
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  let frontmatter: Partial<Frontmatter> = {};
  let body = content;

  if (match) {
    frontmatter = parseFrontmatter(match[1]);
    body = match[2].trim();
  }

  const now = new Date().toISOString();

  return {
    id: filePath,
    title: frontmatter.title || fileNameToTitle(filePath),
    body,
    topic,
    tags: frontmatter.tags || [],
    filePath,
    created: frontmatter.created || now,
    updated: frontmatter.updated || now,
    templateValues: frontmatter.templateValues,
  };
}

export function serializeMarkdown(prompt: Prompt): string {
  const frontmatter: Record<string, unknown> = {
    title: prompt.title,
    created: prompt.created,
    updated: prompt.updated,
    tags: prompt.tags,
  };

  if (prompt.templateValues) {
    const nonEmpty = Object.fromEntries(
      Object.entries(prompt.templateValues).filter(([, v]) => v !== ""),
    );
    if (Object.keys(nonEmpty).length > 0) {
      frontmatter.templateValues = nonEmpty;
    }
  }

  const yaml = dump(frontmatter, {
    noRefs: true,
    lineWidth: -1,
  });

  return `---\n${yaml}---\n\n${prompt.body}\n`;
}

function parseFrontmatter(yaml: string): Partial<Frontmatter> {
  try {
    const parsed = load(yaml);
    if (!isRecord(parsed)) return {};

    const title = asString(parsed.title);
    const created = asString(parsed.created);
    const updated = asString(parsed.updated);
    const tags = asStringArray(parsed.tags);
    const templateValues = asStringRecord(parsed.templateValues);

    return {
      ...(title ? { title } : {}),
      ...(created ? { created } : {}),
      ...(updated ? { updated } : {}),
      ...(tags ? { tags } : {}),
      ...(templateValues ? { templateValues } : {}),
    };
  } catch {
    return {};
  }
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function asStringArray(value: unknown): string[] | undefined {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }
  return undefined;
}

function asStringRecord(value: unknown): Record<string, string> | undefined {
  if (!isRecord(value)) return undefined;

  const entries = Object.entries(value).filter(
    (entry): entry is [string, string] => typeof entry[1] === "string",
  );

  if (entries.length === 0) return undefined;
  return Object.fromEntries(entries);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function fileNameToTitle(filePath: string): string {
  const fileName = filePath.split("/").pop() || "";
  return fileName
    .replace(/\.md$/, "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function titleToFileName(title: string): string {
  return `${title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")}.md`;
}
