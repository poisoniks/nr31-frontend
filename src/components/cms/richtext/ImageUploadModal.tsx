import React, { useState, useRef } from 'react';
import Modal from '../../ui/Modal';
import { useTranslation } from 'react-i18next';
import { Upload, Link as LinkIcon } from 'lucide-react';

interface ImageUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onInsert: (url: string) => void;
}

export const ImageUploadModal: React.FC<ImageUploadModalProps> = ({ isOpen, onClose, onInsert }) => {
    const { t } = useTranslation();
    const [url, setUrl] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        const imageFile = files.find(file => file.type.startsWith('image/'));

        if (imageFile) {
            handleFileUpload(imageFile);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            handleFileUpload(file);
        }
    };

    const handleFileUpload = (file: File) => {
        // Convert to base64 data URL
        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            onInsert(dataUrl);
            handleClose();
        };
        reader.readAsDataURL(file);
    };

    const handleUrlInsert = () => {
        if (url.trim()) {
            onInsert(url.trim());
            handleClose();
        }
    };

    const handleClose = () => {
        setUrl('');
        setIsDragging(false);
        onClose();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && url.trim()) {
            handleUrlInsert();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={t('cms.richtext.image_modal_title')}>
            <div className="space-y-4">
                {/* Drag and Drop Area */}
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                        isDragging
                            ? 'border-nr-accent bg-nr-accent/10'
                            : 'border-nr-border/50 hover:border-nr-accent/50 hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                >
                    <Upload size={32} className="mx-auto mb-3 text-nr-text/40" />
                    <p className="text-sm text-nr-text/80 font-medium mb-1">
                        {t('cms.richtext.drag_drop_image')}
                    </p>
                    <p className="text-xs text-nr-text/50">
                        {t('cms.richtext.or_click_to_browse')}
                    </p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                </div>

                {/* Divider */}
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-nr-border/50"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-nr-bg px-2 text-nr-text/50">
                            {t('cms.richtext.or')}
                        </span>
                    </div>
                </div>

                {/* URL Input */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-nr-text/80">
                        {t('cms.richtext.image_url')}
                    </label>
                    <div className="flex gap-2">
                        <div className="flex-1 relative">
                            <LinkIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-nr-text/40" />
                            <input
                                type="text"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="https://example.com/image.jpg"
                                className="w-full pl-10 pr-3 py-2 bg-black/5 dark:bg-white/5 border border-nr-border/50 rounded-lg text-sm text-nr-text placeholder:text-nr-text/40 focus:outline-none focus:ring-2 focus:ring-nr-accent/50"
                                autoFocus
                            />
                        </div>
                        <button
                            onClick={handleUrlInsert}
                            disabled={!url.trim()}
                            className="px-4 py-2 bg-nr-accent text-white rounded-lg text-sm font-medium hover:bg-nr-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {t('cms.richtext.insert')}
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};
