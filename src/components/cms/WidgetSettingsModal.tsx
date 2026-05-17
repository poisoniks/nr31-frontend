import React from 'react';
import Form from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';
import { useTranslation } from 'react-i18next';
import { useCmsStore } from '../../store/useCmsStore';
import type { WidgetDto } from '../../api/cmsApi';
import Modal from '../ui/Modal';
import { 
    CustomFieldTemplate, 
    CustomObjectFieldTemplate, 
    CustomTitleField, 
    CustomDescriptionField,
    CustomTextWidget,
    CustomSelectWidget,
    CustomCheckboxWidget,
    LocalizedObjectTemplate,
    RichTextWidget
} from './RjsfTemplates';
import { ImagePickerWidget } from './fields/ImagePickerField';
import { LocaleContext } from './LocaleContext';

interface WidgetSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    widget: WidgetDto;
    slotType: string;
    index: number;
}

const customFields = {

};

const templates = {
    FieldTemplate: CustomFieldTemplate,
    ObjectFieldTemplate: CustomObjectFieldTemplate,
    TitleField: CustomTitleField,
    DescriptionField: CustomDescriptionField,
    ButtonTemplates: {
        SubmitButton: () => null, // Hide default submit button
    }
};

const widgets = {
    TextWidget: CustomTextWidget,
    SelectWidget: CustomSelectWidget,
    CheckboxWidget: CustomCheckboxWidget,
    RichTextWidget: RichTextWidget,
    ImagePickerWidget: ImagePickerWidget,
};

export const WidgetSettingsModal: React.FC<WidgetSettingsModalProps> = ({
    isOpen,
    onClose,
    widget,
    slotType,
    index,
}) => {
    const { t } = useTranslation();
    const widgetSchemas = useCmsStore(state => state.widgetSchemas);
    const updateWidget = useCmsStore(state => state.updateWidget);
    const [formData, setFormData] = React.useState(widget);
    const [activeLocale, setActiveLocale] = React.useState<string>('en');

    const widgetId = `${slotType}-${index}-${widget.type}`;
    const prevWidgetIdRef = React.useRef(widgetId);
    
    // Reset form data only when the widget identity changes (e.g. user clicks another widget)
    React.useEffect(() => {
        if (prevWidgetIdRef.current !== widgetId) {
            setFormData(widget);
            prevWidgetIdRef.current = widgetId;
        }
    }, [widgetId, widget]);

    const schema = React.useMemo(() => {
        const rawSchema = widgetSchemas[widget.type];
        if (!rawSchema) return {} as any;

        let s = JSON.parse(JSON.stringify(rawSchema));
        if (s.$schema) delete s.$schema;
        
        const definitions = { ...(s.definitions || {}), ...(s.$defs || {}) };
        
        const resolveRefs = (obj: any): any => {
            if (!obj || typeof obj !== 'object') return obj;
            if (Array.isArray(obj)) return obj.map(resolveRefs);
            
            const newObj: any = { ...obj };
            if (newObj.$ref && typeof newObj.$ref === 'string') {
                const refName = newObj.$ref.split('/').pop() || '';
                const resolved = definitions[refName];
                if (resolved) {
                    const { $ref, ...others } = newObj;
                    return resolveRefs({ ...resolved, ...others });
                }
            }

            for (const [key, value] of Object.entries(newObj)) {
                newObj[key] = resolveRefs(value);
            }
            return newObj;
        };

        const resolved = resolveRefs(s);

        const sanitize = (obj: any) => {
            if (!obj || typeof obj !== 'object') return;
            
            if (obj.properties) {
                Object.entries(obj.properties).forEach(([_, prop]: [string, any]) => {
                    if (prop['x-localized']) {
                        prop.type = 'object';
                        prop.properties = {
                            en: { type: 'string' },
                            uk: { type: 'string' }
                        };
                        prop.additionalProperties = true;
                    }
                    sanitize(prop);
                });
            }
            if (obj.type === 'object') obj.additionalProperties = true;
        };
        
        sanitize(resolved);
        delete resolved.definitions;
        delete resolved.$defs;
        
        // Remove id, type, and bodyContent from schema
        // - id and type are displayed separately as read-only metadata
        // - bodyContent is edited directly via TipTap editor in RichTextWidget
        if (resolved.properties) {
            delete resolved.properties.id;
            delete resolved.properties.type;
            delete resolved.properties.bodyContent;
        }
        if (resolved.required && Array.isArray(resolved.required)) {
            resolved.required = resolved.required.filter((r: string) => 
                r !== 'id' && r !== 'type' && r !== 'bodyContent'
            );
        }
        
        return resolved;
    }, [widgetSchemas, widget.type]);

    const uiSchema = React.useMemo(() => {
        const ui: any = {};
        if (schema.properties) {
            Object.entries(schema.properties).forEach(([key, value]: [string, any]) => {
                // Hide id, type, and bodyContent fields
                if (key === 'id' || key === 'type' || key === 'bodyContent') {
                    ui[key] = { 'ui:widget': 'hidden' };
                } else if (value['x-localized']) {
                    ui[key] = { 
                        'ui:ObjectFieldTemplate': LocalizedObjectTemplate,
                    };
                    if (value['x-widget'] === 'localized-rich-text-input') {
                        ui[key]['en'] = { 'ui:widget': 'RichTextWidget' };
                        ui[key]['uk'] = { 'ui:widget': 'RichTextWidget' };
                    }
                } else if (value['x-widget'] === 'image-picker') {
                    ui[key] = { 'ui:widget': 'ImagePickerWidget' };
                }
            });
        }
        return ui;
    }, [schema]);

    const localeValue = React.useMemo(() => ({ activeLocale, setActiveLocale }), [activeLocale]);

    const handleChange = React.useCallback((e: any) => {
        console.log('Form onChange:', e.formData);
        setFormData(e.formData);
    }, []);

    const handleSubmit = (e: any) => {
        // Preserve bodyContent from the original widget since it's edited via TipTap
        updateWidget(slotType, index, { 
            ...e.formData, 
            id: widget.id, 
            type: widget.type,
            bodyContent: widget.bodyContent 
        });
        onClose();
    };

    // Remove id, type, and bodyContent from formData for the form display
    const formDataForDisplay = React.useMemo(() => {
        const { id, type, bodyContent, ...rest } = formData;
        return rest;
    }, [formData]);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={<span className="text-gold-gradient">{t('cms.widget_settings')}</span>}
        >
            <div className="p-4 pt-0">
                <LocaleContext.Provider value={localeValue}>
                    {Object.keys(schema).length > 0 ? (
                        <>
                            {/* Read-only widget metadata */}
                            <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/10 space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-white/50">ID:</span>
                                    <span className="text-sm text-white/90 font-mono">{widget.id}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-white/50">Type:</span>
                                    <span className="text-sm text-white/90 font-mono">{widget.type}</span>
                                </div>
                            </div>

                            <Form
                                schema={schema}
                                validator={validator}
                                formData={formDataForDisplay}
                                uiSchema={uiSchema}
                                onChange={handleChange}
                                onSubmit={handleSubmit}
                                fields={customFields}
                                templates={templates as any}
                                widgets={widgets as any}
                                className="rjsf-custom"
                            >
                                <div className="flex justify-end gap-3 mt-4">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                                    >
                                        {t('events.edit.cancel')}
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-sm font-bold bg-nr-accent hover:bg-amber-400 text-black rounded-lg shadow-lg shadow-amber-900/20 transition-colors cursor-pointer"
                                    >
                                        {t('events.edit.save')}
                                    </button>
                                </div>
                            </Form>
                        </>
                    ) : (
                        <div className="text-center py-8 text-nr-text/50">
                            Loading schema...
                        </div>
                    )}
                </LocaleContext.Provider>
            </div>
        </Modal>
    );
};
