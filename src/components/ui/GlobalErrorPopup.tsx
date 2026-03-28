import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { X, AlertTriangle } from 'lucide-react';

interface GlobalErrorPopupProps {
    message: string | null;
    onDismiss: () => void;
    durationMs?: number;
}

const GlobalErrorPopup: React.FC<GlobalErrorPopupProps> = ({ message, onDismiss, durationMs = 6000 }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (message) {
            requestAnimationFrame(() => setVisible(true));

            const timer = setTimeout(() => {
                setVisible(false);
                setTimeout(onDismiss, 300);
            }, durationMs);

            return () => clearTimeout(timer);
        } else {
            setVisible(false);
        }
    }, [message, durationMs, onDismiss]);

    if (!message) return null;

    return ReactDOM.createPortal(
        <div
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-[9999] max-w-lg w-full px-4 transition-all duration-300 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
                }`}
        >
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-red-600 text-white shadow-lg shadow-red-900/30 border border-red-500">
                <AlertTriangle size={18} className="shrink-0" />
                <p className="text-sm font-medium flex-1">{message}</p>
                <button
                    onClick={() => {
                        setVisible(false);
                        setTimeout(onDismiss, 300);
                    }}
                    className="shrink-0 p-0.5 rounded hover:bg-red-500 transition-colors cursor-pointer"
                >
                    <X size={16} />
                </button>
            </div>
        </div>,
        document.body
    );
};

export default GlobalErrorPopup;
