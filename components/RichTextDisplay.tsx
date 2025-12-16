import parse from "html-react-parser";

interface RichTextDisplayProps {
  content: string;
}

export function RichTextDisplay({ content }: RichTextDisplayProps) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none break-words [&_img]:rounded-lg [&_img]:mr-auto [&_img]:my-4 [&_a]:text-primary [&_a]:underline [&_a]:hover:no-underline [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-4">
      {parse(content)}
    </div>
  );
}
