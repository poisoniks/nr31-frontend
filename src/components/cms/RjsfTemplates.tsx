import React from 'react';
import type { 
    FieldTemplateProps, 
    TitleFieldProps, 
    DescriptionFieldProps,
    ObjectFieldTemplateProps,
    WidgetProps
} from '@rjsf/utils';
import { TipTapEditor } from './richtext/TipTapEditor';
import LocaleTabBar from '../ui/LocaleTabBar';

export const CustomFieldTemplate = (props: FieldTemplateProps) => {
    const { id, classNames, label, help, required, description, errors, children, schema } = props;
    
    const uiField = props.uiSchema?.['ui:field'];
    const isCustomField = typeof uiField === 'string' && (uiField === 'LocalizedStringField' || uiField === 'LocalizedRichTextField');

    const isLayoutField = schema.type === 'object' || schema.type === 'array';

    return (
        <div className={`${classNames} ${isLayoutField ? '' : 'mb-5'} flex flex-col gap-1.5`}>
            {!isCustomField && label && !isLayoutField && (
                <label htmlFor={id} className="text-sm font-bold text-white flex items-center gap-1.5 tracking-wide">
                    {label}
                    {required && <span className="text-red-500 font-black" title="Required">*</span>}
                </label>
            )}
            {description && !isLayoutField && (
                <div className="text-xs text-nr-text/50 font-light -mt-0.5 mb-0.5 leading-relaxed">{description}</div>
            )}
            <div className="relative">
                {children}
            </div>
            {errors && <div className="mt-1.5 text-xs text-red-400 font-medium">{errors}</div>}
            {help && <div className="mt-1.5 text-xs text-nr-text/30 italic">{help}</div>}
        </div>
    );
};

export const CustomTitleField = ({ title, required }: TitleFieldProps) => (
    <header className="mb-4 pb-2 border-b border-nr-border/20">
        <h3 className="font-serif text-2xl font-bold text-gold-gradient flex items-center gap-3">
            {title}
            {required && <span className="text-red-500 text-sm align-top mt-1">*</span>}
        </h3>
    </header>
);

export const CustomDescriptionField = ({ description }: DescriptionFieldProps) => (
    <p className="text-base text-nr-text/70 mb-6 font-light italic leading-relaxed">{description}</p>
);

export const CustomObjectFieldTemplate = (props: ObjectFieldTemplateProps) => {
    return (
        <div className="space-y-4">
            {props.title && (
                <header className="mb-4 pb-2 border-b border-nr-border/20">
                    <h3 className="font-serif text-2xl font-bold text-gold-gradient flex items-center gap-3">
                        {props.title}
                        {props.required && <span className="text-red-500 text-sm align-top mt-1">*</span>}
                    </h3>
                </header>
            )}
            {props.description && (
                <p className="text-base text-nr-text/70 mb-6 font-light italic leading-relaxed">{props.description}</p>
            )}
            <div className="grid grid-cols-1 gap-0.5">
                {props.properties.map((element) => (
                    <div key={element.name} className="property-wrapper transition-all duration-300">
                        {element.content}
                    </div>
                ))}
            </div>
        </div>
    );
};

export const CustomTextWidget = (props: WidgetProps) => {
    const { id, value, required, disabled, readonly, onChange, onBlur, onFocus, placeholder, type } = props;
    
    return (
        <div className="relative group">
            <input
                id={id}
                type={type === 'number' ? 'number' : 'text'}
                className="w-full bg-black/20 dark:bg-white/5 border border-nr-border/30 rounded-xl px-5 py-3 text-sm text-nr-text placeholder:text-nr-text/20 focus:border-nr-accent/40 focus:ring-2 focus:ring-nr-accent/10 focus:bg-white/10 outline-none transition-all duration-300 disabled:opacity-50 backdrop-blur-sm shadow-sm"
                value={value || ''}
                required={required}
                disabled={disabled}
                readOnly={readonly}
                onChange={(e) => onChange(e.target.value === '' ? undefined : e.target.value)}
                onBlur={() => onBlur(id, value)}
                onFocus={() => onFocus(id, value)}
                placeholder={placeholder}
            />
            <div className="absolute inset-0 rounded-xl bg-nr-accent/5 opacity-0 group-focus-within:opacity-100 pointer-events-none transition-opacity duration-500" />
        </div>
    );
};

export const CustomSelectWidget = (props: WidgetProps) => {
    const { id, options, value, required, disabled, readonly, onChange } = props;
    const { enumOptions } = options;

    return (
        <div className="relative group">
            <select
                id={id}
                className="w-full bg-black/20 dark:bg-white/5 border border-nr-border/30 rounded-xl px-5 py-3 text-sm text-nr-text focus:border-nr-accent/40 focus:ring-2 focus:ring-nr-accent/10 focus:bg-white/10 outline-none transition-all duration-300 disabled:opacity-50 appearance-none cursor-pointer backdrop-blur-sm shadow-sm"
                value={value || ''}
                required={required}
                disabled={disabled || readonly}
                onChange={(e) => onChange(e.target.value)}
            >
                {!required && <option value="" className="bg-nr-surface text-nr-text">---</option>}
                {(enumOptions as any)?.map((option: any, index: number) => (
                    <option key={index} value={option.value} className="bg-nr-surface text-nr-text py-2">
                        {option.label}
                    </option>
                ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-nr-text/30 group-hover:text-nr-accent/50 transition-colors">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </div>
            <div className="absolute inset-0 rounded-xl bg-nr-accent/5 opacity-0 group-focus-within:opacity-100 pointer-events-none transition-opacity duration-500" />
        </div>
    );
};

export const CustomCheckboxWidget = (props: WidgetProps) => {
    const { id, value, disabled, readonly, onChange, label } = props;
    
    return (
        <div className="flex items-center gap-4 py-3 group cursor-pointer select-none">
            <div className="relative flex items-center justify-center">
                <input
                    id={id}
                    type="checkbox"
                    checked={!!value}
                    disabled={disabled || readonly}
                    onChange={(e) => onChange(e.target.checked)}
                    className="peer w-6 h-6 rounded-lg border-2 border-nr-border/30 bg-black/20 dark:bg-white/5 text-nr-accent focus:ring-nr-accent/20 cursor-pointer transition-all appearance-none"
                />
                <div className="absolute pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity text-nr-accent">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 7L6 10L11 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
            </div>
            {label && (
                <label htmlFor={id} className="text-sm font-bold text-nr-text/80 group-hover:text-nr-accent cursor-pointer transition-colors">
                    {label}
                </label>
            )}
        </div>
    );
};
export const LocalizedObjectTemplate = (props: ObjectFieldTemplateProps) => {
    const [localActiveLocale, setLocalActiveLocale] = React.useState<string>('en');

    return (
        <div className="mb-5">
            {/* Label with locale tabs */}
            <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-bold text-white flex items-center gap-1.5 tracking-wide">
                    {props.title}
                    {props.required && <span className="text-red-500 font-black ml-1" title="Required">*</span>}
                </label>
                <LocaleTabBar 
                    activeLocale={localActiveLocale} 
                    onLocaleChange={setLocalActiveLocale} 
                />
            </div>
            {/* Content area - only show active locale, hide labels for individual locale fields */}
            <div className="relative">
                {props.properties.map((element) => (
                    <div 
                        key={element.name} 
                        className={element.name === localActiveLocale ? 'block' : 'hidden'}
                        style={{ marginBottom: 0 }}
                    >
                        {/* Render content without the label wrapper */}
                        <div className="[&>div]:mb-0 [&_label]:hidden">
                            {element.content}
                        </div>
                    </div>
                ))}
            </div>
            {props.description && (
                <p className="mt-1.5 text-xs text-nr-text/40 italic">{props.description}</p>
            )}
        </div>
    );
};


export const RichTextWidget = (props: any) => {
    return (
        <div className="min-h-[200px]">
            <TipTapEditor
                content={props.value}
                onChange={props.onChange}
            />
        </div>
    );
};
