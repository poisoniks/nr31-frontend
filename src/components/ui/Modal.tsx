import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-md glass-card rounded-xl p-6 animate-fade-in-up z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    {title && (
                        <h2 className="text-xl font-serif font-bold text-nr-text">
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
