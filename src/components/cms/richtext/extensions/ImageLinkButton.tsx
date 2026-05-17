import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import { Palette } from 'lucide-react';
import React from 'react';

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
      bgColor: {
        default: null,
      },
      textColor: {
        default: null,
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

const COLOR_PRESETS = [
  { id: 'default', bg: null, text: null, label: 'Default' },
  { id: 'golden', bg: 'linear-gradient(135deg, #D4AF37 0%, #E5B81B 50%, #F4D03F 100%)', text: '#000000', label: 'Golden' },
  { id: 'emerald', bg: '#10b981', text: '#ffffff', label: 'Emerald' },
  { id: 'sapphire', bg: '#3b82f6', text: '#ffffff', label: 'Sapphire' },
  { id: 'ruby', bg: '#ef4444', text: '#ffffff', label: 'Ruby' },
  { id: 'amethyst', bg: '#a855f7', text: '#ffffff', label: 'Amethyst' },
  { id: 'dark', bg: '#1f2937', text: '#ffffff', label: 'Dark' },
  { id: 'light', bg: '#f3f4f6', text: '#1f2937', label: 'Light' },
];

const ImageLinkButtonView = ({ node, updateAttributes, editor }: any) => {
  const { href, label, imageUrl, bgColor, textColor } = node.attrs;
  const isEditable = editor.isEditable;
  const [showColorPicker, setShowColorPicker] = React.useState(false);

  const buttonStyle: React.CSSProperties = {
    background: bgColor || undefined,
    color: textColor || undefined,
  };

  const applyColorPreset = (preset: typeof COLOR_PRESETS[0]) => {
    updateAttributes({ bgColor: preset.bg, textColor: preset.text });
    setShowColorPicker(false);
  };

  return (
    <NodeViewWrapper className="inline-block relative group/button my-2">
      {isEditable ? (
        <div 
          className="inline-flex items-center gap-4 px-4 py-3 rounded-lg border border-nr-border/50 transition-all hover:border-nr-accent/50 group"
          style={buttonStyle}
        >
          {imageUrl && (
            <img src={imageUrl} alt={node.attrs.imageAlt} className="w-8 h-8 shrink-0 rounded-lg shadow-sm object-cover bg-black/10" />
          )}
          {!imageUrl && (
            <div className="w-8 h-8 shrink-0 rounded-lg bg-black/10 flex items-center justify-center text-xs text-nr-text/30">IMG</div>
          )}
          <span className="font-bold transition-colors">{label}</span>
          
          <div className="absolute -top-14 left-0 bg-nr-bg/95 backdrop-blur-xl border border-nr-border/60 p-3 rounded-xl shadow-2xl flex items-center gap-2 opacity-0 invisible pointer-events-none group-hover/button:opacity-100 group-hover/button:visible group-hover/button:pointer-events-auto transition-all z-[100]">
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
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md text-white transition-all"
                title="Colors"
              >
                <Palette size={14} />
              </button>
              {showColorPicker && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-nr-bg/95 backdrop-blur-xl border border-nr-border/60 shadow-xl rounded-xl z-[200] overflow-hidden">
                  <div className="p-2 grid grid-cols-2 gap-1.5">
                    {COLOR_PRESETS.map(preset => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => applyColorPreset(preset)}
                        className="flex items-center gap-2 p-1.5 hover:bg-nr-accent/10 rounded text-left text-[10px] transition-colors text-nr-text/80 cursor-pointer"
                      >
                        <div 
                          className="w-4 h-4 rounded border border-nr-border/50 shadow-sm flex-shrink-0"
                          style={{
                            background: preset.bg || 'linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.1) 49%, transparent 49%, transparent 51%, rgba(0,0,0,0.1) 51%, rgba(0,0,0,0.1) 100%)',
                            backgroundSize: !preset.bg ? '6px 6px' : undefined
                          }}
                        />
                        <span className="font-medium">{preset.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <a
          href={href}
          target={node.attrs.target}
          rel="noopener noreferrer"
          className="inline-flex items-center gap-4 px-4 py-3 rounded-lg border border-nr-border/50 transition-all hover:border-nr-accent/50 group/imglink hover:opacity-90"
          style={buttonStyle}
        >
          {imageUrl && (
            <img src={imageUrl} alt={node.attrs.imageAlt} className="w-8 h-8 shrink-0 rounded-lg shadow-sm object-cover" />
          )}
          <span className="font-bold transition-colors">{label}</span>
        </a>
      )}
    </NodeViewWrapper>
  );
};
