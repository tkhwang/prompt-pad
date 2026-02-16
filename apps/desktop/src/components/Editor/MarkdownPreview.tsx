import "highlight.js/styles/github.css";
import "highlight.js/styles/github-dark.css";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";

interface MarkdownPreviewProps {
  content: string;
}

export function MarkdownPreview({ content }: MarkdownPreviewProps) {
  return (
    <div
      className="prose prose-sm dark:prose-invert max-w-none leading-relaxed"
      style={{
        fontFamily: "var(--editor-font)",
        fontSize: "var(--editor-font-size)",
      }}
    >
      <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
        {content}
      </Markdown>
    </div>
  );
}
