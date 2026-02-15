export function extractVariables(text: string): string[] {
  const regex = /\{\{(\w+)\}\}/g;
  const variables = new Set<string>();
  let match;
  while ((match = regex.exec(text)) !== null) {
    variables.add(match[1]);
  }
  return Array.from(variables);
}

export function substituteVariables(
  text: string,
  values: Record<string, string>
): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_, name) => {
    return values[name] !== undefined ? values[name] : `{{${name}}}`;
  });
}
