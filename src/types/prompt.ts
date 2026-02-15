export interface Prompt {
  id: string;
  title: string;
  body: string;
  topic: string;
  tags: string[];
  filePath: string;
  created: string;
  updated: string;
  templateValues?: Record<string, string>;
}

export interface Topic {
  name: string;
  path: string;
  promptCount: number;
}
