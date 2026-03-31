import React from 'react';
import { useTranslation } from 'react-i18next';
import type { components } from '../../api/types';

type UpdateMode = components['schemas']['UpdateEventRequest']['mode'];

interface DeleteModeDropdownProps {
    onSelect: (mode: UpdateMode) => void;
    onCancel: () => void;
    isRecurring: boolean;
}

const modes: UpdateMode[] = ['SINGLE', 'FUTURE', 'ALL'];

const DeleteModeDropdown: React.FC<DeleteModeDropdownProps> = ({ onSelect, onCancel, isRecurring }) => {
    const { t } = useTranslation();

    const availableModes = isRecurring ? modes : ['SINGLE'] as UpdateMode[];

    return (
        <div className="absolute bottom-full left-0 right-0 mb-2 z-30 animate-fade-in shadow-2xl">
            <div className="bg-nr-surface border border-nr-border rounded-lg p-3">
                <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2 border-b border-nr-border/50 pb-2">
                    {t('events.delete.mode.title')}
                </p>
                <div className="flex flex-col gap-1.5">
                    {availableModes.map((mode) => (
                        <button
                            key={mode}
                            onClick={() => onSelect(mode)}
                            className="w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors border border-transparent text-nr-text hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 cursor-pointer"
                        >
                            <div className="flex flex-col">
                                <span className="font-bold">{t(`events.delete.mode.${mode.toLowerCase()}.title`)}</span>
                                <span className="text-[10px] text-nr-text/60 font-normal mt-0.5 whitespace-normal">
                                    {isRecurring 
                                        ? t(`events.delete.mode.${mode.toLowerCase()}.desc`)
                                        : (mode === 'SINGLE' ? t('events.delete.mode.single.desc_single') : '')
                                    }
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
                <button
                    onClick={onCancel}
                    className="w-full mt-2 px-3 py-1.5 rounded-md text-xs text-nr-text/50 hover:text-nr-text/80 hover:bg-nr-border/30 transition-colors cursor-pointer"
                >
                    {t('events.delete.cancel')}
                </button>
            </div>
        </div>
    );
};

export default DeleteModeDropdown;
