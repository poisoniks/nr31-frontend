import React from 'react';



interface TipTapRendererProps {
  content?: any; // JSON AST
}

export const TipTapRenderer: React.FC<TipTapRendererProps> = ({ content }) => {
  if (!content) return null;
  return (
    <div className="w-full">
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
      return <p className="text-nr-text/80 leading-relaxed mb-4 last:mb-0">{children}</p>;
    case 'heading':
      const level = node.attrs?.level || 2;
      const Tag = `h${level}` as any;
      const headingClasses = level === 1 
        ? "font-serif text-3xl font-bold text-nr-text mb-6 mt-10 first:mt-0" 
        : level === 2
        ? "font-serif text-2xl font-bold text-nr-text mb-4 mt-8 first:mt-0"
        : "font-serif text-xl font-bold text-nr-text mb-3 mt-6 first:mt-0";
      return <Tag className={headingClasses}>{children}</Tag>;
    case 'bulletList':
      return <ul className="space-y-2 text-nr-text/80 list-disc list-inside marker:text-nr-accent my-4">{children}</ul>;
    case 'orderedList':
      return <ol className="space-y-2 text-nr-text/80 list-decimal list-inside marker:text-nr-accent my-4">{children}</ol>;
    case 'listItem':
      return <li className="mb-1 [&>p]:inline [&>p]:mb-0">{children}</li>;
    case 'blockquote':
      return <blockquote className="border-l-4 border-nr-accent pl-4 italic my-4">{children}</blockquote>;
    case 'codeBlock':
      return <pre className="overflow-x-auto"><code className="break-all">{children}</code></pre>;
    case 'horizontalRule':
      return <hr />;
    case 'image':
      return <img src={node.attrs?.src} alt={node.attrs?.alt || ''} title={node.attrs?.title} />;
    
    // Custom extensions
    case 'smallLinkButton':
      const smallBtnStyle: React.CSSProperties = {
        background: node.attrs?.bgColor || undefined,
        color: node.attrs?.textColor || undefined,
      };
      return (
        <a
          href={node.attrs?.href || '#'}
          target={node.attrs?.target || '_blank'}
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-nr-border/50 transition-colors font-medium text-sm group/linkbtn hover:opacity-90"
          style={smallBtnStyle}
        >
          <span className="transition-colors">{node.attrs?.label || 'Link'}</span>
        </a>
      );
    case 'imageLinkButton':
      const imgBtnStyle: React.CSSProperties = {
        background: node.attrs?.bgColor || undefined,
        color: node.attrs?.textColor || undefined,
      };
      return (
        <a
          href={node.attrs?.href || '#'}
          target={node.attrs?.target || '_blank'}
          rel="noopener noreferrer"
          className="inline-flex items-center gap-4 px-4 py-3 rounded-lg border border-nr-border/50 transition-all hover:border-nr-accent/50 group/imglink my-2 hover:opacity-90"
          style={imgBtnStyle}
        >
          {node.attrs?.imageUrl && (
            <img src={node.attrs.imageUrl} alt={node.attrs.imageAlt || ''} className="w-8 h-8 shrink-0 rounded-lg shadow-sm object-cover" />
          )}
          <span className="font-bold transition-colors">{node.attrs?.label || 'Link'}</span>
        </a>
      );

      
    default:
      return children ? <div>{children}</div> : null;
  }
}

function applyMarks(text: string, marks?: any[]): React.ReactNode {
  if (!marks || marks.length === 0) return text;

  let result: React.ReactNode = text;
  let hasColor = false;
  let colorValue = '';

  marks.forEach((mark) => {
    switch (mark.type) {
      case 'bold':
        result = <strong className="font-bold">{result}</strong>;
        break;
      case 'italic':
        result = <em className="italic">{result}</em>;
        break;
      case 'strike':
        result = <s className="line-through">{result}</s>;
        break;
      case 'code':
        result = <code className="bg-black/10 dark:bg-white/10 px-1 rounded font-mono text-sm">{result}</code>;
        break;
      case 'link':
        result = (
          <a 
            href={mark.attrs?.href} 
            target={mark.attrs?.target} 
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-600 hover:underline transition-colors"
          >
            {result}
          </a>
        );
        break;
      case 'goldenText':
        result = <span className="text-gold-gradient">{result}</span>;
        break;
      case 'textStyle':
        if (mark.attrs?.color) {
          hasColor = true;
          colorValue = mark.attrs.color;
        }
        break;
    }
  });

  // Apply color as the outermost wrapper if present
  if (hasColor) {
    result = <span style={{ color: colorValue }}>{result}</span>;
  }

  return result;
}
