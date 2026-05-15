import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { SmallLinkButton } from './extensions/SmallLinkButton';
import { SupportButton } from './extensions/SupportButton';
import { CtaButton } from './extensions/CtaButton';
import { Bold, Italic, Strikethrough, Heading1, Heading2, List, ListOrdered, Quote, Code, Link as LinkIcon, Image as ImageIcon, Minus } from 'lucide-react';

interface TipTapEditorProps {
  content?: any; // JSON AST
  onChange: (content: any) => void;
}

const extensions = [
  StarterKit.configure({
    link: {
      openOnClick: false,
    },
  }),
  Image,
  Placeholder.configure({
    placeholder: 'Write content here...',
  }),
  SmallLinkButton,
  SupportButton,
  CtaButton,
];

export const TipTapEditor: React.FC<TipTapEditorProps> = ({ content, onChange }) => {
  const editor = useEditor({
    extensions,
    content: content || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
    editorProps: {
      attributes: {
        className: 'focus:outline-none max-w-none min-h-[150px] p-4 text-nr-text/80 leading-relaxed ' + 
          '[&_h1]:font-serif [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-nr-text [&_h1]:mb-6 [&_h1]:mt-10 [&_h1:first-child]:mt-0 ' +
          '[&_h2]:font-serif [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-nr-text [&_h2]:mb-4 [&_h2]:mt-8 [&_h2:first-child]:mt-0 ' +
          '[&_h3]:font-serif [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-nr-text [&_h3]:mb-3 [&_h3]:mt-6 [&_h3:first-child]:mt-0 ' +
          '[&_p]:mb-4 [&_p:last-child]:mb-0 ' +
          '[&_ul]:space-y-2 [&_ul]:list-disc [&_ul]:list-inside [&_ul]:marker:text-nr-accent [&_ul]:my-4 ' +
          '[&_ol]:space-y-2 [&_ol]:list-decimal [&_ol]:list-inside [&_ol]:marker:text-nr-accent [&_ol]:my-4 ' +
          '[&_li]:mb-1',
      },
    },
  });

  if (!editor) {
    return null;
  }

  const toggleLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const addImage = () => {
    const url = window.prompt('URL');

    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-nr-border/50 bg-black/5 dark:bg-white/5 sticky top-0 z-10">
        <MenuButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          icon={<Bold size={16} />}
          title="Bold"
        />
        <MenuButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          icon={<Italic size={16} />}
          title="Italic"
        />
        <MenuButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          icon={<Strikethrough size={16} />}
          title="Strike"
        />
        <div className="w-px h-4 bg-nr-border mx-1" />
        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          icon={<Heading1 size={16} />}
          title="Heading 1"
        />
        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          icon={<Heading2 size={16} />}
          title="Heading 2"
        />
        <div className="w-px h-4 bg-nr-border mx-1" />
        <MenuButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          icon={<List size={16} />}
          title="Bullet List"
        />
        <MenuButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          icon={<ListOrdered size={16} />}
          title="Ordered List"
        />
        <div className="w-px h-4 bg-nr-border mx-1" />
        <MenuButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          icon={<Quote size={16} />}
          title="Blockquote"
        />
        <MenuButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive('codeBlock')}
          icon={<Code size={16} />}
          title="Code Block"
        />
        <MenuButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          icon={<Minus size={16} />}
          title="Horizontal Rule"
        />
        <div className="w-px h-4 bg-nr-border mx-1" />
        <MenuButton
          onClick={toggleLink}
          isActive={editor.isActive('link')}
          icon={<LinkIcon size={16} />}
          title="Link"
        />
        <MenuButton
          onClick={addImage}
          icon={<ImageIcon size={16} />}
          title="Image"
        />
        <div className="w-px h-4 bg-nr-border mx-1" />
        <MenuButton
          onClick={() => editor.chain().focus().insertContent('<a data-type="smallLinkButton">Link</a>').run()}
          icon={<span className="text-[10px] font-bold px-1 border border-current rounded">BTN 1</span>}
          title="Small Link Button"
        />
        <MenuButton
          onClick={() => editor.chain().focus().insertContent('<a data-type="supportButton">Support Us</a>').run()}
          icon={<span className="text-[10px] font-bold px-1 border border-current rounded">BTN 2</span>}
          title="Support Button"
        />
        <MenuButton
          onClick={() => editor.chain().focus().insertContent('<div data-type="ctaButton"></div>').run()}
          icon={<span className="text-[10px] font-bold px-1 border border-current rounded text-amber-500">CTA</span>}
          title="CTA Button"
        />
      </div>



      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

const MenuButton = ({ onClick, isActive, icon, title }: any) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={`p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors ${isActive ? 'bg-nr-accent/20 text-nr-accent' : 'text-nr-text/70'
      }`}
  >
    {icon}
  </button>
);
