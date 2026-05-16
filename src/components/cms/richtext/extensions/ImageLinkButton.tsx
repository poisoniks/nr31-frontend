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
          <span className="font-bold text-nr-text group-hover/button:text-nr-accent transition-colors">{label}</span>
          
          <div className="absolute -top-14 left-0 bg-nr-bg/95 backdrop-blur-xl border border-nr-border/60 p-3 rounded-xl shadow-2xl flex items-center gap-3 opacity-0 invisible pointer-events-none group-hover/button:opacity-100 group-hover/button:visible group-hover/button:pointer-events-auto transition-all z-[100]">
            <input
              type="text"
              value={label}
              onChange={e => updateAttributes({ label: e.target.value })}
              className="w-28 text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded-md px-2 py-1.5 text-white placeholder:text-white/30 outline-none focus:border-nr-accent/50 transition-all"
              placeholder="Label"
            />
            <input
              type="text"
              value={href}
              onChange={e => updateAttributes({ href: e.target.value })}
              className="w-40 text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded-md px-2 py-1.5 text-white placeholder:text-white/30 outline-none focus:border-nr-accent/50 transition-all"
              placeholder="URL"
            />
            <input
              type="text"
              value={imageUrl}
              onChange={e => updateAttributes({ imageUrl: e.target.value })}
              className="w-40 text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded-md px-2 py-1.5 text-white placeholder:text-white/30 outline-none focus:border-nr-accent/50 transition-all"
              placeholder="Image URL"
            />
          </div>
        </div>
      ) : (
        <a
          href={href}
          target={node.attrs.target}
          rel="noopener noreferrer"
          className="flex items-center gap-4 bg-black/5 dark:bg-white/5 px-4 py-3 rounded-lg border border-nr-border/50 transition-all hover:border-nr-accent/50 hover:bg-black/10 dark:hover:bg-white/10 group/imglink"
        >
          {imageUrl && (
            <img src={imageUrl} alt={node.attrs.imageAlt} className="w-8 h-8 shrink-0 rounded-lg shadow-sm object-cover" />
          )}
          <span className="font-bold text-nr-text group-hover/imglink:text-nr-accent transition-colors">{label}</span>
        </a>
      )}
    </NodeViewWrapper>
  );
};
