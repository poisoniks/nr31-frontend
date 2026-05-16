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
        <div className="inline-flex items-center gap-2 bg-black/5 dark:bg-black/20 hover:bg-nr-accent/10 px-4 py-2 rounded-lg border border-nr-border/50 transition-colors text-nr-text font-medium text-sm group/linkbtn">
          <span className="group-hover/linkbtn:text-nr-accent transition-colors">{label}</span>
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
          </div>
        </div>
      ) : (
        <a
          href={href}
          target={node.attrs.target}
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-black/5 dark:bg-black/20 hover:bg-nr-accent/10 px-4 py-2 rounded-lg border border-nr-border/50 transition-colors text-nr-text font-medium text-sm group/linkbtn"
        >
          <span className="group-hover/linkbtn:text-nr-accent transition-colors">{label}</span>
        </a>
      )}
    </NodeViewWrapper>
  );
};
