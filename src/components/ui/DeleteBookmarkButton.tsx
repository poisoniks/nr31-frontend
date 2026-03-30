import React from 'react';
import { X } from 'lucide-react';

interface DeleteBookmarkButtonProps {
    isActive: boolean;
    onClick: () => void;
    className?: string;
}

const DeleteBookmarkButton: React.FC<DeleteBookmarkButtonProps> = ({ isActive, onClick, className = '' }) => {
    return (
        <button
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            className={`
                absolute -left-12 z-20
                w-10 h-8 flex items-center justify-center pl-1
                shadow-lg transition-all duration-200 ease-out
                cursor-pointer
                ${isActive
                    ? 'bg-red-500 text-white shadow-red-500/40 scale-110'
                    : 'bg-nr-surface text-nr-text/60 hover:text-red-500 hover:bg-nr-surface/90 border border-nr-border border-r-0'
                }
                ${className}
            `}
            title="Delete"
            style={{
                clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 15% 100%, 0 50%)',
            }}
        >
            <X size={14} />
        </button>
    );
};

export default DeleteBookmarkButton;
