import ReactMarkdown from "react-markdown"

function sanitize(content: string): string {
  return content.replace(/<script[\s\S]*?<\/script>/gi, "")
}

export function MarkdownRenderer({ content }: { content: string }) {
  return <ReactMarkdown>{sanitize(content)}</ReactMarkdown>
}