import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';

export const SmallLinkButton = Node.create({
  name: 'smallLinkButton',

  group: 'inline',
  inline: true,

  addAttributes() {
    return {
      href: {
        default: '#',
      },
      label: {
        default: 'Link',
      },
      target: {
        default: '_blank',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'a[data-type="smallLinkButton"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['a', mergeAttributes(HTMLAttributes, { 'data-type': 'smallLinkButton' }), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(SmallLinkButtonView);
  },
});

const SmallLinkButtonView = ({ node, updateAttributes, editor }: any) => {
  const { href, label } = node.attrs;
  const isEditable = editor.isEditable;

  return (
    <NodeViewWrapper className="inline-block relative group/button">
      {isEditable ? (
        <div className="inline-flex items-center gap-2 bg-black/5 dark:bg-black/20 hover:bg-nr-accent/10 px-4 py-2 rounded-lg border border-nr-border/50 transition-colors text-nr-text font-medium text-sm">
          <span>{label}</span>
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
          </div>
        </div>
      ) : (
        <a
          href={href}
          target={node.attrs.target}
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-black/5 dark:bg-black/20 hover:bg-nr-accent/10 px-4 py-2 rounded-lg border border-nr-border/50 transition-colors text-nr-text font-medium text-sm"
        >
          {label}
        </a>
      )}
    </NodeViewWrapper>
  );
};
