import axios from 'axios';
import type { CmsWidgetValidationError } from '../store/useCmsStore';

/**
 * Extracts error message and code from backend ErrorResponse.
 * Uses translation keys if available, otherwise falls back to message from server.
 */
export const getErrorMessage = (error: unknown, t: any): string => {
    if (axios.isAxiosError(error)) {
        const data = error.response?.data as any;

        if (data && data.code) {
            if (data.code === 'CMS_VALIDATION_ERROR' && data.details) {
                const details = Object.entries(data.details)
                    .map(([key, i18nKey]) => {
                        const context = data.context?.[key] || {};
                        return t(i18nKey as string, { ...context });
                    })
                    .join('; ');
                return details || data.message || t('error.CMS_VALIDATION_ERROR');
            }

            if (data.code === 'VALIDATION_ERROR' && data.details) {
                const details = Object.entries(data.details)
                    .map(([, msg]) => `${msg}`)
                    .join('; ');
                return details || data.message || t('error.VALIDATION_ERROR');
            }

            const translationKey = `error.${data.code}`;
            return t(translationKey, {
                ...data.metadata,
                defaultValue: data.message
            });
        }

        if (error.response?.status === 413) {
            return t('error.FILE_TOO_LARGE', { defaultValue: 'File is too large' });
        }
    }

    return t('common.error.unexpected', { defaultValue: 'An unexpected error occurred' });
};

/**
 * Parses a CMS validation error response into structured widget-level validation errors.
 */
export const parseCmsValidationErrors = (error: unknown, t: any): CmsWidgetValidationError[] => {
    if (!axios.isAxiosError(error)) {
        return [];
    }

    const data = error.response?.data as any;
    if (!data || data.code !== 'CMS_VALIDATION_ERROR' || !data.details) {
        return [];
    }

    const errors: CmsWidgetValidationError[] = [];

    for (const [key, i18nKey] of Object.entries(data.details)) {
        const context = data.context?.[key] || {};
        const translatedMessage = t(i18nKey as string, { ...context });

        // Parse key. Pattern: widget:<widget-uuid>:<field-name>
        const widgetMatch = key.match(/^widget:([a-fA-F0-9-]{36}):(.+)$/);
        if (widgetMatch) {
            const widgetId = widgetMatch[1];
            const field = widgetMatch[2];
            errors.push({
                widgetId,
                field,
                widgetType: context.widgetType || undefined,
                slotType: context.slotType || undefined,
                translatedMessage
            });
        } else {
            // General or layout validation error
            errors.push({
                translatedMessage
            });
        }
    }

    return errors;
};
