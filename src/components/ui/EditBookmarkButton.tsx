import React from 'react';
import { Pencil } from 'lucide-react';

interface EditBookmarkButtonProps {
    isActive: boolean;
    onClick: () => void;
    className?: string;
}

const EditBookmarkButton: React.FC<EditBookmarkButtonProps> = ({ isActive, onClick, className = '' }) => {
    return (
        <button
            onClick={onClick}
            className={`
                absolute -left-12 top-1.5 z-20
                w-10 h-8 flex items-center justify-center pl-1
                shadow-lg transition-all duration-200 ease-out
                cursor-pointer
                ${isActive
                    ? 'bg-nr-accent text-white shadow-nr-accent/40 scale-110'
                    : 'bg-nr-surface text-nr-text/60 hover:text-nr-accent hover:bg-nr-surface/90 border border-nr-border border-r-0'
                }
                ${className}
            `}
            title="Edit"
            style={{
                clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 15% 100%, 0 50%)',
            }}
        >
            <Pencil size={14} />
        </button>
    );
};

export default EditBookmarkButton;
