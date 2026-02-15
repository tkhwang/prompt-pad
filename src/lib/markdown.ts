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
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  let frontmatter: Partial<Frontmatter> = {};
  let body = content;

  if (match) {
    frontmatter = parseYamlSimple(match[1]);
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
  const lines = [
    "---",
    `title: "${prompt.title}"`,
    `created: ${prompt.created}`,
    `updated: ${prompt.updated}`,
    `tags: [${prompt.tags.map((t) => `"${t}"`).join(", ")}]`,
  ];

  if (prompt.templateValues) {
    const nonEmpty = Object.fromEntries(
      Object.entries(prompt.templateValues).filter(([, v]) => v !== ""),
    );
    if (Object.keys(nonEmpty).length > 0) {
      lines.push(`templateValues: ${JSON.stringify(nonEmpty)}`);
    }
  }

  lines.push("---");

  return `${lines.join("\n")}\n\n${prompt.body}\n`;
}

function parseYamlSimple(yaml: string): Partial<Frontmatter> {
  const result: Record<string, unknown> = {};

  for (const line of yaml.split("\n")) {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;

    const key = line.slice(0, colonIdx).trim();
    let value: string | string[] = line.slice(colonIdx + 1).trim();

    if (value.startsWith("{") && value.endsWith("}")) {
      try {
        result[key] = JSON.parse(value);
      } catch {
        result[key] = value;
      }
      continue;
    }

    if (value.startsWith("[") && value.endsWith("]")) {
      result[key] = value
        .slice(1, -1)
        .split(",")
        .map((s) => s.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean);
      continue;
    }

    value = value.replace(/^["']|["']$/g, "");
    result[key] = value;
  }

  return result as Partial<Frontmatter>;
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
