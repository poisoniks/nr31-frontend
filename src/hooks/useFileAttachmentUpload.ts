import { useState, useCallback, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import { cmsApi } from '../api/cmsApi';
import { useUIStore } from '../store/useUIStore';
import { useTranslation } from 'react-i18next';

export const useFileAttachmentUpload = (editor: Editor | null) => {
    const [isUploading, setIsUploading] = useState(false);
    const [allowedMimeTypes, setAllowedMimeTypes] = useState<string[]>([]);
    const setError = useUIStore((state) => state.setError);
    const { t } = useTranslation();

    useEffect(() => {
        const fetchMimeTypes = async () => {
            try {
                const types = await cmsApi.getAllowedMimeTypes();
                setAllowedMimeTypes(types);
            } catch (error) {
                console.error('Failed to fetch allowed MIME types', error);
                // Fallback to standard formats
                setAllowedMimeTypes(['image/png', 'image/jpeg', 'image/webp']);
            }
        };
        fetchMimeTypes();
    }, []);

    const uploadAndInsert = useCallback(
        async (file: File, insertAtPos?: number) => {
            if (!editor) return;

            // Optional client-side validation against fetched MIME types
            if (allowedMimeTypes.length > 0) {
                const isAllowed = allowedMimeTypes.some(type => {
                    if (type === '*/*') return true;
                    if (type.endsWith('/*')) {
                        const category = type.split('/')[0];
                        return file.type.startsWith(category + '/');
                    }
                    return type.toLowerCase() === file.type.toLowerCase();
                });

                if (!isAllowed) {
                    setError(t('error.INVALID_FILE_TYPE'));
                    return;
                }
            }

            // Size check: 500MB = 500 * 1024 * 1024 bytes
            const MAX_SIZE = 500 * 1024 * 1024;
            if (file.size > MAX_SIZE) {
                setError(t('error.FILE_TOO_LARGE'));
                return;
            }

            setIsUploading(true);
            try {
                const res = await cmsApi.uploadAttachment(file);
                const url = res.url || `/api/v1/files/${res.id}`;
                const pos = insertAtPos !== undefined ? insertAtPos : editor.state.selection.to;

                editor
                    .chain()
                    .focus()
                    .insertContentAt(pos, {
                        type: 'fileAttachment',
                        attrs: {
                            fileId: res.id,
                            url: url,
                            originalName: res.originalName || file.name,
                            contentType: file.type || res.originalName.split('.').pop() || 'application/octet-stream',
                            size: res.size || file.size,
                            displayStyle: 'compact',
                        },
                    })
                    .run();
            } catch (error: any) {
                console.error('Attachment upload failed', error);
                const errorCode = error.response?.data?.details?.id || 'cms.richtext.upload_error';
                setError(t(errorCode));
            } finally {
                setIsUploading(false);
            }
        },
        [editor, allowedMimeTypes, setError, t]
    );

    return {
        uploadAndInsert,
        isUploading,
        allowedMimeTypes,
    };
};
