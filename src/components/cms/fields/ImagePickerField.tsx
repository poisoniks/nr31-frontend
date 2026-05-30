import React, { useState } from 'react';
import type { WidgetProps } from '@rjsf/utils';
import { Image } from 'lucide-react';
import FileLibraryModal from '../../library/FileLibraryModal';
import { libraryApi } from '../../../api/libraryApi';
import Button from '../../ui/Button';

export const ImagePickerWidget: React.FC<WidgetProps> = (props) => {
    const { value, onChange, schema } = props;
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSelect = (file: any) => {
        onChange(file.id);
        setIsModalOpen(false);
    };

    const handleRemove = () => {
        onChange(undefined);
    };

    const imageUrl = value ? libraryApi.getFileUrl(value, 300) : null;

    return (
        <div className="mb-3">
            <div className="flex items-start gap-6">
                <div className="w-36 h-36 rounded-xl border-2 border-dashed border-nr-border/30 overflow-hidden bg-black/20 dark:bg-white/5 flex items-center justify-center shrink-0 group hover:border-nr-accent/30 transition-all duration-300 shadow-inner">
                    {imageUrl ? (
                        <img src={imageUrl} alt="Selected" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                        <Image className="text-nr-text/10 group-hover:text-nr-accent/20 transition-colors" size={40} />
                    )}
                </div>
                
                <div className="flex flex-col gap-2">
                    <Button 
                        type="button" 
                        variant="secondary" 
                        size="sm" 
                        onClick={() => setIsModalOpen(true)}
                    >
                        {value ? 'Change Image' : 'Select Image'}
                    </Button>
                    {value && (
                        <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            onClick={handleRemove}
                            className="text-red-400 hover:text-red-300"
                        >
                            Remove
                        </Button>
                    )}
                </div>
            </div>

            {schema.description && (
                <p className="mt-2 text-xs text-nr-text/50">{schema.description}</p>
            )}

            <FileLibraryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSelect={handleSelect}
                selectedFileId={value}
            />
        </div>
    );
};
