import React from 'react';
import type { FieldProps } from '@rjsf/utils';
import { useLocale } from '../LocaleContext';
import LocaleTabBar from '../../ui/LocaleTabBar';

export const LocalizedStringField: React.FC<FieldProps> = (props) => {
    const { formData, onChange, schema, required } = props;
    const { activeLocale, setActiveLocale } = useLocale();

    const data = formData || {};

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({
            ...data,
            [activeLocale]: e.target.value,
        }, []);
    };

    return (
        <div className="mb-3">
            <label className="block text-sm font-bold text-white mb-1.5 tracking-wide">
                {schema.title || props.name} {required && <span className="text-red-500 font-black">*</span>}
            </label>
            
            <div className="relative">
                <LocaleTabBar 
                    activeLocale={activeLocale} 
                    onLocaleChange={setActiveLocale} 
                />
                <div className="border border-nr-border/30 rounded-b-xl rounded-tr-xl overflow-hidden bg-nr-surface/50 dark:bg-white/5 backdrop-blur-sm relative z-0">
                    <input
                        id={props.idSchema?.$id}
                        name={props.name}
                        type="text"
                        value={data[activeLocale] || ''}
                        onChange={handleTextChange}
                        onBlur={props.onBlur && (() => props.onBlur(props.idSchema?.$id, data))}
                        onFocus={props.onFocus && (() => props.onFocus(props.idSchema?.$id, data))}
                        className="w-full bg-transparent px-4 py-3 text-sm text-nr-text placeholder:text-nr-text/20 outline-none focus:bg-white/5 transition-all"
                        placeholder={`Enter text in ${activeLocale.toUpperCase()}...`}
                    />
                </div>
            </div>
            
            {schema.description && (
                <p className="mt-1 text-xs text-nr-text/50">{schema.description}</p>
            )}
        </div>
    );
};
