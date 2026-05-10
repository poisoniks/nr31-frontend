import React from 'react';

import Button from '../../ui/Button';

interface TipTapRendererProps {
  content?: any; // JSON AST
}

export const TipTapRenderer: React.FC<TipTapRendererProps> = ({ content }) => {
  if (!content) return null;
  return (
    <div className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl dark:prose-invert max-w-none">
      {content.content?.map((node: any, index: number) => (
        <React.Fragment key={index}>{renderNode(node)}</React.Fragment>
      ))}
    </div>
  );
};

function renderNode(node: any): React.ReactNode {
  if (!node) return null;

  if (node.type === 'text') {
    return applyMarks(node.text, node.marks);
  }

  const children = node.content?.map((child: any, index: number) => (
    <React.Fragment key={index}>{renderNode(child)}</React.Fragment>
  ));

  switch (node.type) {
    case 'paragraph':
      return <p>{children}</p>;
    case 'heading':
      const Tag = `h${node.attrs?.level || 2}` as any;
      return <Tag className="font-serif">{children}</Tag>;
    case 'bulletList':
      return <ul>{children}</ul>;
    case 'orderedList':
      return <ol>{children}</ol>;
    case 'listItem':
      return <li>{children}</li>;
    case 'blockquote':
      return <blockquote>{children}</blockquote>;
    case 'codeBlock':
      return <pre><code>{children}</code></pre>;
    case 'horizontalRule':
      return <hr />;
    case 'image':
      return <img src={node.attrs?.src} alt={node.attrs?.alt || ''} title={node.attrs?.title} />;
    
    // Custom extensions
    case 'smallLinkButton':
      return (
        <a
          href={node.attrs?.href || '#'}
          target={node.attrs?.target || '_blank'}
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-black/5 dark:bg-black/20 hover:bg-nr-accent/10 px-4 py-2 rounded-lg border border-nr-border/50 transition-colors text-nr-text font-medium text-sm"
        >
          {node.attrs?.label || 'Link'}
        </a>
      );
    case 'supportButton':
      return (
        <a
          href={node.attrs?.href || '#'}
          target={node.attrs?.target || '_blank'}
          rel="noopener noreferrer"
          className="flex items-center gap-4 bg-black/5 dark:bg-white/5 px-4 py-3 rounded-lg border border-nr-border/50 transition-all hover:border-nr-accent/50 hover:bg-black/10 dark:hover:bg-white/10 group my-2"
        >
          {node.attrs?.imageUrl && (
            <img src={node.attrs.imageUrl} alt={node.attrs.imageAlt || ''} className="w-8 h-8 shrink-0 rounded-lg shadow-sm object-cover bg-black/10" />
          )}
          <span className="font-bold text-nr-text group-hover:text-nr-accent transition-colors">{node.attrs?.label || 'Support Us'}</span>
        </a>
      );
    case 'ctaButton':
      return (
        <div className="my-4">
            <Button 
                variant="primary" 
                className="shadow-lg shadow-amber-900/40 transform hover:scale-105 font-bold"
                onClick={() => {
                    if (node.attrs?.scrollTarget) {
                        document.getElementById(node.attrs.scrollTarget)?.scrollIntoView({ behavior: 'smooth' });
                    } else if (node.attrs?.href) {
                        window.location.href = node.attrs.href;
                    }
                }}
            >
                {node.attrs?.label || 'Call to Action'}
            </Button>
        </div>
      );
      
    default:
      return children ? <div>{children}</div> : null;
  }
}

function applyMarks(text: string, marks?: any[]): React.ReactNode {
  if (!marks || marks.length === 0) return text;

  let result: React.ReactNode = text;

  marks.forEach((mark) => {
    switch (mark.type) {
      case 'bold':
        result = <strong>{result}</strong>;
        break;
      case 'italic':
        result = <em>{result}</em>;
        break;
      case 'strike':
        result = <s>{result}</s>;
        break;
      case 'code':
        result = <code>{result}</code>;
        break;
      case 'link':
        result = (
          <a href={mark.attrs?.href} target={mark.attrs?.target} rel="noopener noreferrer">
            {result}
          </a>
        );
        break;
    }
  });

  return result;
}
