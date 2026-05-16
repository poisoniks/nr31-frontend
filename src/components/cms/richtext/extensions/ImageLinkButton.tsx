import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';

export const ImageLinkButton = Node.create({
  name: 'imageLinkButton',

  group: 'block',
  atom: true,

  addAttributes() {
    return {
      href: {
        default: '#',
      },
      label: {
        default: 'Link',
      },
      imageUrl: {
        default: '',
      },
      imageAlt: {
        default: '',
      },
      target: {
        default: '_blank',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'a[data-type="imageLinkButton"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['a', mergeAttributes(HTMLAttributes, { 'data-type': 'imageLinkButton' }), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageLinkButtonView);
  },
});

const ImageLinkButtonView = ({ node, updateAttributes, editor }: any) => {
  const { href, label, imageUrl } = node.attrs;
  const isEditable = editor.isEditable;

  return (
    <NodeViewWrapper className="block relative group/button my-2">
      {isEditable ? (
        <div className="flex items-center gap-4 bg-black/5 dark:bg-white/5 px-4 py-3 rounded-lg border border-nr-border/50 transition-all hover:border-nr-accent/50 hover:bg-black/10 dark:hover:bg-white/10 group">
          {imageUrl && (
            <img src={imageUrl} alt={node.attrs.imageAlt} className="w-8 h-8 shrink-0 rounded-lg shadow-sm object-cover bg-black/10" />
          )}
          {!imageUrl && (
            <div className="w-8 h-8 shrink-0 rounded-lg bg-black/10 flex items-center justify-center text-xs text-nr-text/30">IMG</div>
          )}
          <span className="font-bold text-nr-text group-hover:text-nr-accent transition-colors">{label}</span>
          
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/90 p-2 rounded-lg shadow-lg flex items-center gap-2 opacity-0 group-hover/button:opacity-100 transition-opacity z-50 pointer-events-auto">
            <input
              type="text"
              value={label}
              onChange={e => updateAttributes({ label: e.target.value })}
              className="w-24 text-xs bg-transparent border-b border-white/20 text-white outline-none"
              placeholder="Label"
            />
            <input
              type="text"
              value={href}
              onChange={e => updateAttributes({ href: e.target.value })}
              className="w-32 text-xs bg-transparent border-b border-white/20 text-white outline-none"
              placeholder="URL"
            />
            <input
              type="text"
              value={imageUrl}
              onChange={e => updateAttributes({ imageUrl: e.target.value })}
              className="w-32 text-xs bg-transparent border-b border-white/20 text-white outline-none"
              placeholder="Image URL"
            />
          </div>
        </div>
      ) : (
        <a
          href={href}
          target={node.attrs.target}
          rel="noopener noreferrer"
          className="flex items-center gap-4 bg-black/5 dark:bg-white/5 px-4 py-3 rounded-lg border border-nr-border/50 transition-all hover:border-nr-accent/50 hover:bg-black/10 dark:hover:bg-white/10 group"
        >
          {imageUrl && (
            <img src={imageUrl} alt={node.attrs.imageAlt} className="w-8 h-8 shrink-0 rounded-lg shadow-sm object-cover" />
          )}
          <span className="font-bold text-nr-text group-hover:text-nr-accent transition-colors">{label}</span>
        </a>
      )}
    </NodeViewWrapper>
  );
};
