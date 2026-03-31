import React from 'react';
import { useTranslation } from 'react-i18next';
import type { components } from '../../api/types';

type UpdateMode = components['schemas']['UpdateEventRequest']['mode'];

interface SaveModeDropdownProps {
    onSelect: (mode: UpdateMode) => void;
    onCancel: () => void;
    disabledModes?: UpdateMode[];
}

const modes: UpdateMode[] = ['SINGLE', 'FUTURE', 'ALL'];

const SaveModeDropdown: React.FC<SaveModeDropdownProps> = ({ onSelect, onCancel, disabledModes = [] }) => {
    const { t } = useTranslation();

    return (
        <div className="absolute bottom-full left-0 right-0 mb-2 z-30 animate-fade-in shadow-2xl">
            <div className="bg-nr-surface border border-nr-border rounded-lg p-3">
                <p className="text-xs font-bold text-nr-text/60 uppercase tracking-wider mb-2">
                    {t('events.edit.mode.title')}
                </p>
                <div className="flex flex-col gap-1.5">
                    {modes.map((mode) => {
                        const isDisabled = disabledModes.includes(mode);
                        return (
                            <button
                                key={mode}
                                disabled={isDisabled}
                                onClick={() => onSelect(mode)}
                                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium
                                    transition-colors border border-transparent
                                    ${isDisabled 
                                        ? 'text-nr-text/30 cursor-not-allowed opacity-50' 
                                        : 'text-nr-text hover:bg-nr-accent/20 hover:text-nr-accent hover:border-nr-accent/30 cursor-pointer'
                                    }`}
                            >
                                <div className="flex flex-col">
                                    <span>{t(`events.edit.mode.${mode.toLowerCase()}`)}</span>
                                    {isDisabled && (
                                        <span className="text-[10px] text-nr-text/40 font-normal">
                                            {t('events.edit.mode.disabled_discord')}
                                        </span>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
                <button
                    onClick={onCancel}
                    className="w-full mt-2 px-3 py-1.5 rounded-md text-xs text-nr-text/50
                        hover:text-nr-text/80 hover:bg-nr-border/30 transition-colors cursor-pointer"
                >
                    {t('events.edit.cancel')}
                </button>
            </div>
        </div>
    );
};

export default SaveModeDropdown;
