export function extractVariables(text: string): string[] {
  const regex = /\{\{(\w+)\}\}/g;
  const variables = new Set<string>();
  for (const match of text.matchAll(regex)) {
    variables.add(match[1]);
  }
  return Array.from(variables);
}

export function substituteVariables(
  text: string,
  values: Record<string, string>,
): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_, name) => {
    return values[name] !== undefined ? values[name] : `{{${name}}}`;
  });
}
