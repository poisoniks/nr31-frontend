import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { SmallLinkButton } from './extensions/SmallLinkButton';
import { ImageLinkButton } from './extensions/ImageLinkButton';
import { GoldenText } from './extensions/GoldenText';
import { FileAttachment } from './extensions/FileAttachment';
import { useFileAttachmentUpload } from '../../../hooks/useFileAttachmentUpload';
import { useTranslation } from 'react-i18next';
import { Bold, Italic, Strikethrough, Heading1, Heading2, List, ListOrdered, Quote, Code, Link as LinkIcon, Image as ImageIcon, Minus, Plus, Search, Palette, Paperclip, Loader2 } from 'lucide-react';

interface TipTapEditorProps {
  content?: any; // JSON AST
  onChange: (content: any) => void;
}



const EDITOR_STYLES = 'focus:outline-none max-w-none text-nr-text/80 leading-relaxed ' +
  '[&_h1]:font-serif [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-nr-text [&_h1]:mb-6 [&_h1]:mt-10 [&_h1:first-child]:mt-0 ' +
  '[&_h2]:font-serif [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-nr-text [&_h2]:mb-4 [&_h2]:mt-8 [&_h2:first-child]:mt-0 ' +
  '[&_h3]:font-serif [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-nr-text [&_h3]:mb-3 [&_h3]:mt-6 [&_h3:first-child]:mt-0 ' +
  '[&_p]:mb-4 [&_p:last-child]:mb-0 ' +
  '[&_ul]:space-y-2 [&_ul]:list-disc [&_ul]:list-inside [&_ul]:marker:text-nr-accent [&_ul]:my-4 ' +
  '[&_ol]:space-y-2 [&_ol]:list-decimal [&_ol]:list-inside [&_ol]:marker:text-nr-accent [&_ol]:my-4 ' +
  '[&_li]:mb-1 ' +
  '[&_li>p]:inline [&_li>p]:mb-0 ' +
  '[&_a]:text-blue-500 [&_a]:underline ' +
  '[&_strong]:font-bold [&_em]:italic [&_s]:line-through [&_code]:bg-black/10 [&_code]:dark:bg-white/10 [&_code]:px-1 [&_code]:rounded [&_code]:font-mono [&_code]:text-sm ' +
  '[&_blockquote]:border-l-4 [&_blockquote]:border-nr-accent [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-4';

export const TipTapEditor: React.FC<TipTapEditorProps> = ({ content, onChange }) => {
  const { t } = useTranslation();
  // Force re-render when selection changes to update toolbar button states
  const [, setSelectionUpdate] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const colorPickerRef = React.useRef<HTMLDivElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const isInternalDragRef = React.useRef(false);
  const dragStartPosRef = React.useRef<number | null>(null);
  const dragStartNodeRef = React.useRef<any | null>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (colorPickerRef.current && !colorPickerRef.current.contains(e.target as Node)) {
        setColorPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const colors = [
    { id: 'default', label: t('cms.richtext.color_default'), value: null, gradient: false },
    { id: 'golden', label: t('cms.richtext.color_golden'), value: null, gradient: true },
    { id: 'emerald', label: t('cms.richtext.color_emerald'), value: '#10b981', gradient: false },
    { id: 'sapphire', label: t('cms.richtext.color_sapphire'), value: '#3b82f6', gradient: false },
    { id: 'ruby', label: t('cms.richtext.color_ruby'), value: '#ef4444', gradient: false },
    { id: 'amethyst', label: t('cms.richtext.color_amethyst'), value: '#a855f7', gradient: false },
  ];

  const customElements = [
    {
      id: 'linkButton',
      label: t('cms.richtext.btn_small'),
      icon: <LinkIcon size={16} />,
      onClick: () => editor.chain().focus().insertContent(`<a data-type="smallLinkButton">${t('cms.richtext.default_link_text')}</a>`).run()
    },
    {
      id: 'imageLinkButton',
      label: t('cms.richtext.btn_support'),
      icon: <ImageIcon size={16} />,
      onClick: () => editor.chain().focus().insertContent(`<a data-type="imageLinkButton">${t('cms.richtext.default_support_text')}</a>`).run()
    }
  ];

  const filteredElements = customElements.filter(el =>
    el.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const extensions = React.useMemo(() => [
    StarterKit.configure({
      link: {
        openOnClick: false,
      },
    }),
    Image,
    TextStyle,
    Color,
    GoldenText,
    Placeholder.configure({
      placeholder: t('cms.richtext.placeholder'),
    }),
    SmallLinkButton,
    ImageLinkButton,
    FileAttachment,
  ], [t]);

  const editor = useEditor({
    extensions,
    content: content || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
    onSelectionUpdate: () => {
      // Trigger re-render to update toolbar button active states
      setSelectionUpdate(prev => prev + 1);
    },
    editorProps: {
      attributes: {
        class: `${EDITOR_STYLES} min-h-[150px] p-4`,
      },
      handlePaste: (_view, event) => {
        handleEditorPaste(event);
        return false;
      },
      handleDOMEvents: {
        dragstart: (view, event) => {
          const { selection } = view.state;
          // Check if we're dragging a node (image, file attachment, etc.)
          if ('node' in selection && selection.node) {
            isInternalDragRef.current = true;
            dragStartPosRef.current = selection.from;
            dragStartNodeRef.current = selection.node;
            // Set drag effect to indicate move operation
            if (event.dataTransfer) {
              event.dataTransfer.effectAllowed = 'move';
            }
          }
          return false;
        },
        dragend: () => {
          // Don't clear refs immediately - let drop handler use them first
          setTimeout(() => {
            isInternalDragRef.current = false;
            dragStartPosRef.current = null;
            dragStartNodeRef.current = null;
          }, 0);
          return false;
        },
      },
      handleDrop: (view, event, _slice, moved) => {
        // Custom drag & drop block node move handler
        if (isInternalDragRef.current && dragStartNodeRef.current && dragStartPosRef.current !== null) {
          event.preventDefault();
          event.stopPropagation();

          const coordinates = view.posAtCoords({
            left: event.clientX,
            top: event.clientY,
          });

          if (coordinates) {
            const dropPos = coordinates.pos;
            const node = dragStartNodeRef.current;
            const startPos = dragStartPosRef.current;

            // Calculate the adjusted drop position
            let adjustedDropPos = dropPos;
            if (dropPos > startPos) {
              // If dropping after the original position, account for the node being removed
              adjustedDropPos = dropPos - node.nodeSize;
            }

            const tr = view.state.tr;
            // Delete original node
            tr.delete(startPos, startPos + node.nodeSize);
            // Insert at the adjusted position
            tr.insert(adjustedDropPos, node);
            view.dispatch(tr);

            // Clear refs
            isInternalDragRef.current = false;
            dragStartPosRef.current = null;
            dragStartNodeRef.current = null;
            return true;
          }
        }

        // Handle external file drops
        const files = Array.from(event.dataTransfer?.files || []);
        if (files.length > 0 && !isInternalDragRef.current) {
          event.preventDefault();
          event.stopPropagation();
          setIsDraggingFile(false);

          const coordinates = view.posAtCoords({
            left: event.clientX,
            top: event.clientY,
          });

          if (coordinates) {
            uploadAndInsert(files[0], coordinates.pos);
            return true;
          }
        }

        // Let ProseMirror handle text/content moves
        if (moved) {
          return false;
        }

        return false;
      },
    },
  });

  const { uploadAndInsert, isUploading, allowedMimeTypes } = useFileAttachmentUpload(editor);

  if (!editor) {
    return null;
  }

  const toggleLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt(t('cms.richtext.prompt_url'), previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const handleAttachFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadAndInsert(file);
      e.target.value = '';
    }
  };

  const handleEditorDragOver = (e: React.DragEvent) => {
    if (isInternalDragRef.current) return;
    const hasFiles = Array.from(e.dataTransfer.items).some(item => item.kind === 'file');
    if (hasFiles) {
      e.preventDefault();
      e.stopPropagation();
      setIsDraggingFile(true);
    }
  };

  const handleEditorDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
  };

  const handleEditorDrop = (_e: React.DragEvent) => {
    setIsDraggingFile(false);
    isInternalDragRef.current = false;
  };

  const handleEditorPaste = (e: ClipboardEvent) => {
    const items = Array.from(e.clipboardData?.items || []);
    const fileItem = items.find(item => item.kind === 'file');

    if (fileItem) {
      e.preventDefault();
      const file = fileItem.getAsFile();
      if (file) {
        uploadAndInsert(file);
      }
    }
  };

  const applyColor = (colorValue: string | null, isGradient: boolean) => {
    if (colorValue === null && !isGradient) {
      // Remove all color formatting
      editor.chain().focus().unsetColor().unsetGoldenText().run();
    } else if (isGradient) {
      // Apply golden gradient
      editor.chain().focus().unsetColor().setGoldenText().run();
    } else {
      // Apply solid color
      editor.chain().focus().unsetGoldenText().setColor(colorValue!).run();
    }
    setColorPickerOpen(false);
  };

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-nr-border/50 bg-black/5 dark:bg-white/5 sticky top-0 z-10">
        <MenuButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          icon={<Bold size={16} />}
          title={t('cms.richtext.bold')}
        />
        <MenuButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          icon={<Italic size={16} />}
          title={t('cms.richtext.italic')}
        />
        <MenuButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          icon={<Strikethrough size={16} />}
          title={t('cms.richtext.strike')}
        />
        <div className="w-px h-4 bg-nr-border mx-1" />
        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          icon={<Heading1 size={16} />}
          title={t('cms.richtext.h1')}
        />
        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          icon={<Heading2 size={16} />}
          title={t('cms.richtext.h2')}
        />
        <div className="w-px h-4 bg-nr-border mx-1" />
        <MenuButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          icon={<List size={16} />}
          title={t('cms.richtext.ul')}
        />
        <MenuButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          icon={<ListOrdered size={16} />}
          title={t('cms.richtext.ol')}
        />
        <div className="w-px h-4 bg-nr-border mx-1" />
        <MenuButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          icon={<Quote size={16} />}
          title={t('cms.richtext.quote')}
        />
        <MenuButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive('codeBlock')}
          icon={<Code size={16} />}
          title={t('cms.richtext.code')}
        />
        <MenuButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          icon={<Minus size={16} />}
          title={t('cms.richtext.hr')}
        />
        <div className="w-px h-4 bg-nr-border mx-1" />
        <MenuButton
          onClick={toggleLink}
          isActive={editor.isActive('link')}
          icon={<LinkIcon size={16} />}
          title={t('cms.richtext.link')}
        />
        <MenuButton
          onClick={handleAttachFileClick}
          icon={<Paperclip size={16} />}
          title={t('cms.richtext.attach_file')}
        />
        <div className="w-px h-4 bg-nr-border mx-1" />
        <div className="relative" ref={colorPickerRef}>
          <MenuButton
            onClick={() => setColorPickerOpen(!colorPickerOpen)}
            isActive={colorPickerOpen || editor.isActive('textStyle')}
            icon={<Palette size={16} />}
            title={t('cms.richtext.text_color')}
          />
          
          {colorPickerOpen && (
            <div className="absolute left-0 top-full mt-2 w-56 bg-nr-bg/95 backdrop-blur-xl border border-nr-border/60 shadow-xl rounded-xl z-50 overflow-hidden animate-fade-in-up">
              <div className="p-2">
                <div className="text-[10px] uppercase tracking-wider text-nr-text/50 font-bold mb-2 px-2">
                  {t('cms.richtext.text_color')}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {colors.map(color => (
                    <button
                      key={color.id}
                      onClick={() => applyColor(color.value, color.gradient)}
                      className="flex items-center gap-2 p-2 hover:bg-nr-accent/10 rounded-lg text-left text-xs transition-colors text-nr-text/80 group cursor-pointer"
                    >
                      <div 
                        className={`w-6 h-6 rounded border border-nr-border/50 shadow-sm flex-shrink-0 ${color.gradient ? '' : ''}`}
                        style={{
                          background: color.gradient 
                            ? 'linear-gradient(135deg, #D4AF37 0%, #E5B81B 50%, #F4D03F 100%)' 
                            : color.value 
                            ? color.value 
                            : 'linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.1) 49%, transparent 49%, transparent 51%, rgba(0,0,0,0.1) 51%, rgba(0,0,0,0.1) 100%)',
                          backgroundSize: color.value === null && !color.gradient ? '8px 8px' : undefined
                        }}
                      />
                      <span className="font-medium">{color.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="w-px h-4 bg-nr-border mx-1" />
        <div className="relative" ref={dropdownRef}>
          <MenuButton
            onClick={() => setDropdownOpen(!dropdownOpen)}
            isActive={dropdownOpen}
            icon={<Plus size={16} />}
            title={t('cms.richtext.add_element')}
          />
          
          {dropdownOpen && (
            <div className="absolute left-0 top-full mt-2 w-64 bg-nr-bg/95 backdrop-blur-xl border border-nr-border/60 shadow-xl rounded-xl z-50 overflow-hidden animate-fade-in-up">
              <div className="p-2 border-b border-nr-border/50 flex items-center gap-2 bg-black/5">
                <Search size={14} className="text-nr-text/40" />
                <input
                  type="text"
                  autoFocus
                  placeholder={t('cms.richtext.search')}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-xs text-nr-text w-full"
                />
              </div>
              <div className="p-1 max-h-48 overflow-y-auto">
                {filteredElements.map(el => (
                  <button
                    key={el.id}
                    onClick={() => {
                      el.onClick();
                      setDropdownOpen(false);
                      setSearchQuery('');
                    }}
                    className="flex items-center gap-3 w-full p-2 hover:bg-nr-accent/10 hover:text-nr-accent rounded-lg text-left text-xs transition-colors text-nr-text/80 group cursor-pointer"
                  >
                    <div className="text-nr-text/40 group-hover:text-nr-accent transition-colors">
                      {el.icon}
                    </div>
                    <span className="font-medium">{el.label}</span>
                  </button>
                ))}
                {filteredElements.length === 0 && (
                  <div className="p-4 text-center text-xs text-nr-text/40 italic">
                    {t('roster.search.placeholder')}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>



      <div className={`flex-1 p-4 ${EDITOR_STYLES}`}>
        <div
          onDragStart={() => { isInternalDragRef.current = true; }}
          onDragEnd={() => { isInternalDragRef.current = false; }}
          onDragOver={handleEditorDragOver}
          onDragLeave={handleEditorDragLeave}
          onDrop={handleEditorDrop}
          className="relative h-full"
        >
          <EditorContent editor={editor} />
          {isDraggingFile && (
            <div className="absolute inset-0 bg-nr-accent/10 border-2 border-dashed border-nr-accent rounded-lg flex items-center justify-center pointer-events-none z-20 animate-pulse">
              <div className="text-center">
                <Paperclip size={48} className="mx-auto mb-2 text-nr-accent animate-bounce" />
                <p className="text-sm font-medium text-nr-accent">
                  {t('cms.richtext.drop_file_here')}
                </p>
              </div>
            </div>
          )}
          {isUploading && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] rounded-lg flex items-center justify-center pointer-events-none z-20">
              <div className="text-center bg-nr-bg/90 border border-nr-border/60 p-4 rounded-xl shadow-xl flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-nr-accent animate-spin" />
                <span className="text-sm font-medium text-nr-text">{t('cms.richtext.uploading')}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={allowedMimeTypes.join(',')}
        className="hidden"
      />
    </div>
  );
};

const MenuButton = ({ onClick, isActive, icon, title }: any) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={`p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer ${isActive ? 'bg-nr-accent/20 text-nr-accent' : 'text-nr-text/70'
      }`}
  >
    {icon}
  </button>
);
