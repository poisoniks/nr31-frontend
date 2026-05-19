import React from 'react';
import { Link } from 'react-router-dom';
import { Folder, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { KbFolderDto } from '../../api/kbApi';

interface KbFolderCardProps {
    folder: KbFolderDto;
}

const KbFolderCard: React.FC<KbFolderCardProps> = ({ folder }) => {
    const { i18n } = useTranslation();
    const currentLang = i18n.language || 'en';
    const folderName = folder.name?.[currentLang] || folder.name?.['en'] || folder.name?.['uk'] || '';

    return (
        <Link
            to={`/kb/folder/${folder.slug}`}
            className="group flex items-start gap-4 p-5 glass-card rounded-xl hover:border-nr-accent/40 hover:shadow-[0_0_15px_rgba(245,158,11,0.15)] transition-all duration-300 relative overflow-hidden"
        >
            <div className="absolute top-0 left-0 w-1 h-full bg-nr-accent/0 group-hover:bg-nr-accent transition-all duration-300"></div>
            
            <div className="p-3 bg-nr-accent/10 rounded-lg text-nr-accent group-hover:bg-nr-accent group-hover:text-white transition-all duration-300">
                <Folder size={24} className="stroke-[1.5]" />
            </div>
            
            <div className="flex-1 min-w-0 flex flex-col gap-1">
                <h3 className="font-serif font-bold text-lg text-nr-text group-hover:text-nr-accent transition-colors duration-300 truncate">
                    {folderName}
                </h3>
                {folder.restricted && (
                    <div className="flex items-center gap-1.5 text-xs text-amber-500 font-medium mt-1">
                        <Lock size={12} />
                        <span>Restricted</span>
                    </div>
                )}
            </div>
        </Link>
    );
};

export default KbFolderCard;
