import React from 'react';
import type { FieldProps } from '@rjsf/utils';
import { useLocale } from '../LocaleContext';
import LocaleTabBar from '../../ui/LocaleTabBar';
import { TipTapEditor } from '../richtext/TipTapEditor';

export const LocalizedRichTextField: React.FC<FieldProps> = (props) => {
    const { formData, onChange, schema, required } = props;
    const { activeLocale, setActiveLocale } = useLocale();

    const data = formData || {};

    const handleContentChange = (content: any) => {
        onChange({
            ...data,
            [activeLocale]: content,
        });
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
                <div 
                    className="border border-nr-border/30 rounded-b-xl rounded-tr-xl overflow-hidden bg-black/20 dark:bg-white/5 backdrop-blur-sm relative z-0 shadow-sm"
                    onBlur={props.onBlur && (() => props.onBlur(props.idSchema?.$id, data))}
                    onFocus={props.onFocus && (() => props.onFocus(props.idSchema?.$id, data))}
                >
                    <TipTapEditor
                        key={activeLocale}
                        content={data[activeLocale]}
                        onChange={handleContentChange}
                    />
                </div>
            </div>
            
            {schema.description && (
                <p className="mt-1 text-xs text-nr-text/50">{schema.description}</p>
            )}
        </div>
    );
};
