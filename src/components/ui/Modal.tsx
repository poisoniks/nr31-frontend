import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: React.ReactNode;
    children: React.ReactNode;
    contentClassName?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, contentClassName = '' }) => {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div 
            className="fixed inset-0 z-[100] overflow-y-auto overflow-x-hidden flex items-start justify-center p-4 sm:p-6 md:p-8 pt-16 sm:pt-20 md:pt-24"
            onClick={onClose}
        >
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in -z-10"
            />

            {/* Modal Content */}
            <div 
                className={`relative w-full max-w-md glass-card rounded-xl p-6 animate-fade-in-up z-10 my-auto ${contentClassName}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    {title && (
                        <h2 className="text-xl font-serif font-bold text-nr-text flex items-center gap-2">
                            {title}
                        </h2>
                    )}
                    <button
                        onClick={onClose}
                        className="ml-auto p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 text-nr-text/60 hover:text-nr-text transition-colors"
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                {children}
            </div>
        </div>,
        document.body
    );
};

export default Modal;
