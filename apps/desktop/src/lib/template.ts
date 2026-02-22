const VARIABLE_PATTERN = /\{\{([\w#\-. ]+)\}\}/g;

export function extractVariables(text: string): string[] {
  const regex = new RegExp(VARIABLE_PATTERN.source, VARIABLE_PATTERN.flags);
  const variables = new Set<string>();
  for (const match of text.matchAll(regex)) {
    variables.add(match[1].trim());
  }
  return Array.from(variables);
}

export function substituteVariables(
  text: string,
  values: Record<string, string>,
): string {
  return text.replace(VARIABLE_PATTERN, (_, name) => {
    const trimmed = name.trim();
    return values[trimmed] ? values[trimmed] : `{{${trimmed}}}`;
  });
}
