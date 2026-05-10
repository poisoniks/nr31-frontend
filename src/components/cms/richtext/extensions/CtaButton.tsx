import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import Button from '../../../ui/Button';

export const CtaButton = Node.create({
  name: 'ctaButton',

  group: 'block',
  atom: true,

  addAttributes() {
    return {
      href: {
        default: '',
      },
      label: {
        default: 'Call to Action',
      },
      scrollTarget: {
        default: '',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="ctaButton"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'ctaButton' }), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CtaButtonView);
  },
});

const CtaButtonView = ({ node, updateAttributes, editor }: any) => {
  const { href, label, scrollTarget } = node.attrs;
  const isEditable = editor.isEditable;

  const handleClick = () => {
    if (scrollTarget) {
      document.getElementById(scrollTarget)?.scrollIntoView({ behavior: 'smooth' });
    } else if (href) {
      window.location.href = href;
    }
  };

  return (
    <NodeViewWrapper className="block relative group/button my-4">
      {isEditable ? (
        <div className="relative inline-block">
          <Button variant="primary" className="shadow-lg shadow-amber-900/40 transform hover:scale-105 font-bold pointer-events-none">
            {label}
          </Button>
          
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
              placeholder="URL (optional)"
            />
            <input
              type="text"
              value={scrollTarget}
              onChange={e => updateAttributes({ scrollTarget: e.target.value })}
              className="w-32 text-xs bg-transparent border-b border-white/20 text-white outline-none"
              placeholder="Scroll Target ID"
            />
          </div>
        </div>
      ) : (
        <Button 
            variant="primary" 
            className="shadow-lg shadow-amber-900/40 transform hover:scale-105 font-bold"
            onClick={handleClick}
        >
          {label}
        </Button>
      )}
    </NodeViewWrapper>
  );
};
