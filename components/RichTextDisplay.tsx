import parse from "html-react-parser";

interface RichTextDisplayProps {
  content: string;
  /** Use compact styling for smaller contexts like previews */
  compact?: boolean;
}

export function RichTextDisplay({ content, compact = false }: RichTextDisplayProps) {
  return (
    <div 
      className={`
        prose dark:prose-invert max-w-none break-words overflow-hidden
        
        /* Base text styling - softer colors, better line-height */
        text-foreground/90
        ${compact ? 'prose-sm leading-relaxed' : 'prose-base leading-7'}
        
        /* Paragraph spacing - more breathing room */
        [&_p]:mb-5 [&_p]:leading-7 [&_p:last-child]:mb-0
        
        /* Headings with better spacing */
        [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-8 [&_h1]:mb-4
        [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-6 [&_h2]:mb-3
        [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-5 [&_h3]:mb-2
        
        /* Images */
        [&_img]:rounded-lg [&_img]:my-6 [&_img]:mx-auto [&_img]:shadow-sm
        
        /* Links */
        [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 
        [&_a]:decoration-primary/40 [&_a]:hover:decoration-primary 
        [&_a]:transition-colors
        
        /* Lists with proper spacing */
        [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-4 [&_ul]:space-y-2
        [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-4 [&_ol]:space-y-2
        [&_li]:leading-relaxed
        
        /* Enhanced Blockquote - prominent styling */
        [&_blockquote]:relative
        [&_blockquote]:my-6 
        [&_blockquote]:py-4 
        [&_blockquote]:pl-6 
        [&_blockquote]:pr-4
        [&_blockquote]:bg-muted/40 
        [&_blockquote]:rounded-r-lg
        [&_blockquote]:border-l-4 
        [&_blockquote]:border-primary
        [&_blockquote]:italic 
        [&_blockquote]:text-foreground/80
        [&_blockquote_p]:mb-0
        
        /* Code styling */
        [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:bg-muted 
        [&_code]:text-sm [&_code]:font-mono [&_code]:before:content-none [&_code]:after:content-none
        
        /* Pre/code blocks */
        [&_pre]:my-4 [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:bg-muted [&_pre]:overflow-x-auto
        
        /* Horizontal rule */
        [&_hr]:my-8 [&_hr]:border-border/50
        
        /* Tables */
        [&_table]:my-4 [&_table]:w-full
        [&_th]:text-left [&_th]:p-2 [&_th]:border-b [&_th]:font-semibold
        [&_td]:p-2 [&_td]:border-b [&_td]:border-border/50
      `}
    >
      {parse(content)}
    </div>
  );
}
