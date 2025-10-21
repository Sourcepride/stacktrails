import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";

const MarkdownRenderer = ({
  content,
  className,
}: {
  content: string;
  className?: string;
}) => {
  return (
    <div
      className={`relative prose prose-neutral   max-w-none w-full ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        rehypePlugins={[rehypeSanitize]} // sanitizes output
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
