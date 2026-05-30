import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Code, X, ArrowLeftRight } from 'lucide-react';
import Button from '../../ui/Button';

interface JsonSidePanelProps {
    isOpen: boolean;
    onClose: () => void;
    content: any; // Current parsed JSON content
    onChange: (parsedContent: any) => void;
}

export const JsonSidePanel: React.FC<JsonSidePanelProps> = ({
    isOpen,
    onClose,
    content,
    onChange
}) => {
    const { t } = useTranslation();
    const [jsonEditorContent, setJsonEditorContent] = useState('');
    const [isTextareaFocused, setIsTextareaFocused] = useState(false);
    const [panelWidth, setPanelWidth] = useState(400);
    const [isDragging, setIsDragging] = useState(false);
    const [footerHeight, setFooterHeight] = useState(0);
    const [panelSide, setPanelSide] = useState<'right' | 'left'>('right');

    // Sync content to textarea when parent changes, but only if not focused
    useEffect(() => {
        if (!isTextareaFocused && isOpen) {
            setJsonEditorContent(JSON.stringify(content || {}, null, 2));
        }
    }, [content, isTextareaFocused, isOpen]);

    // Footer spacing detection
    useEffect(() => {
        if (!isOpen) return;

        const handleScroll = () => {
            const footer = document.querySelector('footer');
            if (!footer) return;
            const rect = footer.getBoundingClientRect();
            const visibleFooterHeight = Math.max(0, window.innerHeight - rect.top);
            setFooterHeight(visibleFooterHeight);
        };

        window.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', handleScroll);
        handleScroll();
        const timer = setTimeout(handleScroll, 100);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
            clearTimeout(timer);
        };
    }, [isOpen]);

    // Resize drag handling
    useEffect(() => {
        if (!isDragging) return;

        const handleMouseMove = (e: MouseEvent) => {
            const newWidth = panelSide === 'right'
                ? Math.max(280, Math.min(800, window.innerWidth - e.clientX))
                : Math.max(280, Math.min(800, e.clientX));
            setPanelWidth(newWidth);
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, panelSide]);

    if (!isOpen) return null;

    return createPortal(
        <div 
            style={{ 
                width: `${panelWidth}px`,
                bottom: `${footerHeight}px`,
                height: `calc(100vh - 4rem - ${footerHeight}px)`
            }}
            className={`fixed top-16 ${panelSide === 'right' ? 'right-0 border-l' : 'left-0 border-r'} bg-nr-bg/95 backdrop-blur-xl border-nr-border/30 z-[100] flex flex-col shadow-2xl animate-fade-in ${
                isDragging ? 'select-none' : ''
            }`}
        >
            {/* Resizing edge handle */}
            <div
                onMouseDown={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                }}
                className={`absolute ${panelSide === 'right' ? 'left-0' : 'right-0'} top-0 bottom-0 w-1.5 cursor-ew-resize hover:bg-nr-accent/40 active:bg-nr-accent transition-colors z-20 ${
                    isDragging ? 'bg-nr-accent' : 'bg-nr-border/20'
                }`}
            />
            <div className="flex items-center justify-between p-4 border-b border-nr-border/15">
                <h3 className="font-serif text-lg font-bold text-nr-text">{t('kb.json_editor')}</h3>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setPanelSide(prev => prev === 'right' ? 'left' : 'right')}
                        className="text-nr-text/50 hover:text-nr-text hover:bg-nr-accent/10 p-1.5 rounded-lg transition-colors cursor-pointer"
                        title={t('kb.move_panel_side', { defaultValue: 'Move to other side' })}
                    >
                        <ArrowLeftRight size={18} />
                    </button>
                    <button type="button" onClick={onClose} className="text-nr-text/50 hover:text-nr-text hover:bg-nr-accent/10 p-1.5 rounded-lg transition-colors cursor-pointer">
                        <X size={18} />
                    </button>
                </div>
            </div>
            <div className="p-4 flex-1 flex flex-col gap-4 overflow-hidden">
                <textarea
                    value={jsonEditorContent}
                    onChange={(e) => {
                        const val = e.target.value;
                        setJsonEditorContent(val);
                        try {
                            const parsed = JSON.parse(val);
                            onChange(parsed);
                        } catch (err) {
                            // Silently fail to allow typing invalid JSON states
                        }
                    }}
                    onFocus={() => setIsTextareaFocused(true)}
                    onBlur={() => setIsTextareaFocused(false)}
                    className="flex-1 w-full p-4 rounded-xl bg-black/20 dark:bg-white/5 border border-nr-border/30 text-nr-text font-mono text-xs focus:outline-none focus:border-nr-accent focus:ring-1 focus:ring-nr-accent resize-none custom-scrollbar"
                    placeholder={t('kb.json_placeholder', { defaultValue: 'Paste TipTap JSON here...' })}
                />
                <Button 
                    type="button" 
                    onClick={() => {
                        try {
                            const parsed = JSON.parse(jsonEditorContent);
                            setJsonEditorContent(JSON.stringify(parsed, null, 2));
                        } catch (err) {
                            alert(t('kb.invalid_json', { defaultValue: 'Invalid JSON formatting' }));
                        }
                    }}
                    className="w-full flex items-center justify-center gap-2"
                >
                    <Code size={16} />
                    {t('kb.format_json', { defaultValue: 'Format JSON' })}
                </Button>
            </div>
        </div>,
        document.body
    );
};
