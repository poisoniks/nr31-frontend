import axios from 'axios';

/**
 * Extracts error message and code from backend ErrorResponse.
 * Uses translation keys if available, otherwise falls back to message from server.
 */
export const getErrorMessage = (error: unknown, t: any): string => {
    if (axios.isAxiosError(error)) {
        const data = error.response?.data as any;

        if (data && data.code) {
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
