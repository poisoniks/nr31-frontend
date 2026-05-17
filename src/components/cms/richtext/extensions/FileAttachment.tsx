import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import { File, FileArchive, FileCode, FileVideo, FileAudio, Trash2, LayoutGrid, List } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const FileAttachment = Node.create({
  name: 'fileAttachment',

  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      fileId: {
        default: '',
      },
      url: {
        default: '',
      },
      originalName: {
        default: 'file',
      },
      contentType: {
        default: '',
      },
      size: {
        default: 0,
      },
      displayStyle: {
        default: 'compact',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="fileAttachment"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'fileAttachment' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FileAttachmentView);
  },
});

const getFileIcon = (contentType: string) => {
  if (!contentType) return File;
  const type = contentType.toLowerCase();
  if (type.startsWith('video/')) return FileVideo;
  if (type.startsWith('audio/')) return FileAudio;
  if (type.includes('zip') || type.includes('tar') || type.includes('rar') || type.includes('7z') || type.includes('gzip')) return FileArchive;
  if (type.includes('html') || type.includes('javascript') || type.includes('json') || type.includes('css') || type.includes('xml')) return FileCode;
  return File;
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const FileAttachmentView = ({ node, updateAttributes, deleteNode, editor }: any) => {
  const { url, originalName, contentType, size, displayStyle } = node.attrs;
  const isEditable = editor.isEditable;
  const { t } = useTranslation();

  const isImage = contentType?.startsWith('image/');
  const Icon = getFileIcon(contentType);
  const sizeStr = formatFileSize(size);
  const extension = originalName.split('.').pop()?.toUpperCase() || 'FILE';

  if (isImage) {
    return (
      <NodeViewWrapper data-drag-handle className="block relative my-4 group/attachment select-none max-w-full cursor-grab active:cursor-grabbing">
        <div className="relative inline-block overflow-hidden rounded-lg border border-nr-border/40 bg-nr-bg/20 shadow-md">
          <img
            src={url}
            alt={originalName}
            draggable="false"
            className="max-h-[350px] max-w-full object-contain block"
          />
          {isEditable && (
            <div className="absolute top-2 right-2 bg-nr-bg/90 backdrop-blur-md border border-nr-border/60 p-1.5 rounded-lg shadow-md opacity-0 group-hover/attachment:opacity-100 transition-opacity z-10 flex items-center gap-1">
              <span className="text-[10px] px-2 text-nr-text/60 font-mono truncate max-w-[120px]">{originalName}</span>
              <button
                type="button"
                onClick={deleteNode}
                className="p-1 hover:bg-red-500/20 hover:text-red-400 text-nr-text/60 rounded transition-colors"
                title={t('cms.delete')}
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>
      </NodeViewWrapper>
    );
  }

  // Non-image files render compact or box depending on displayStyle
  return (
    <NodeViewWrapper data-drag-handle className="block relative group/attachment my-3 select-none cursor-grab active:cursor-grabbing">
      {displayStyle === 'compact' ? (
        <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-nr-border/40 bg-black/10 dark:bg-white/5 text-nr-text hover:border-nr-accent/40 transition-colors text-sm font-medium">
          <Icon className="w-4 h-4 text-nr-accent" />
          <span className="truncate max-w-[200px]">{originalName}</span>
          <span className="text-xs text-nr-text/40 font-mono">{sizeStr}</span>
        </div>
      ) : (
        <div className="flex items-center gap-4 p-4 rounded-xl border border-nr-border/40 bg-black/20 dark:bg-white/5 backdrop-blur-md shadow-md max-w-md">
          <div className="w-12 h-12 rounded-lg bg-nr-accent/10 flex flex-col items-center justify-center border border-nr-accent/20 shrink-0">
            <Icon className="w-6 h-6 text-nr-accent" />
            <span className="text-[9px] font-bold text-nr-accent/80 font-sans tracking-wide mt-0.5">{extension}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm text-nr-text truncate" title={originalName}>
              {originalName}
            </div>
            <div className="text-xs text-nr-text/50 font-mono mt-0.5">
              {sizeStr}
            </div>
          </div>
        </div>
      )}

      {isEditable && (
        <div className="absolute -top-14 left-0 bg-nr-bg/95 backdrop-blur-xl border border-nr-border/60 p-2.5 rounded-xl shadow-2xl flex items-center gap-2 opacity-0 invisible pointer-events-none group-hover/attachment:opacity-100 group-hover/attachment:visible group-hover/attachment:pointer-events-auto transition-all z-[100]">
          <button
            type="button"
            onClick={() => updateAttributes({ displayStyle: 'compact' })}
            className={`p-1.5 rounded-lg flex items-center gap-1.5 text-xs font-medium transition-colors ${displayStyle === 'compact'
                ? 'bg-nr-accent/20 text-nr-accent'
                : 'hover:bg-white/5 text-nr-text/70'
              }`}
          >
            <List size={14} />
            <span>{t('cms.richtext.file_display_compact')}</span>
          </button>

          <button
            type="button"
            onClick={() => updateAttributes({ displayStyle: 'box' })}
            className={`p-1.5 rounded-lg flex items-center gap-1.5 text-xs font-medium transition-colors ${displayStyle === 'box'
                ? 'bg-nr-accent/20 text-nr-accent'
                : 'hover:bg-white/5 text-nr-text/70'
              }`}
          >
            <LayoutGrid size={14} />
            <span>{t('cms.richtext.file_display_box')}</span>
          </button>

          <div className="w-px h-5 bg-nr-border/50 mx-1" />

          <button
            type="button"
            onClick={deleteNode}
            className="p-1.5 hover:bg-red-500/20 hover:text-red-400 text-nr-text/60 rounded-lg transition-colors"
            title={t('cms.delete')}
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </NodeViewWrapper>
  );
};
