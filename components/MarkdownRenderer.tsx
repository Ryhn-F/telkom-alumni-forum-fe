import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import remarkBreaks from "remark-breaks";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none break-words">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          img: ({ ...props }) => (
            <img 
              {...props} 
              className="rounded-lg max-h-[500px] object-contain mr-auto my-4" 
              loading="lazy"
            />
          ),
          a: ({ ...props }) => (
             <a {...props} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:no-underline" />
          )
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
