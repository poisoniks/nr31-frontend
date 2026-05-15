import React from 'react';
import { useTranslation } from 'react-i18next';
import { Swords } from 'lucide-react';
import Button from '../../ui/Button';
import type { WidgetDto } from '../../../api/cmsApi';
import { libraryApi } from '../../../api/libraryApi';

export const HeroWidget: React.FC<{ widget: WidgetDto; isEditMode: boolean }> = ({ widget, isEditMode }) => {
    const { i18n } = useTranslation();
    const currentLang = i18n.language.split('-')[0];
    const data = widget as any;

    const badgeText = data.badgeText?.[currentLang] || data.badgeText?.['en'] || 'M&B Bannerlord Regiment';
    const titleMain = data.titleMain?.[currentLang] || data.titleMain?.['en'] || 'Nr.31';
    const titleSub = data.titleSub?.[currentLang] || data.titleSub?.['en'] || 'Feldkanonenregiment';
    const description = data.description?.[currentLang] || data.description?.['en'] || 'Join the elite artillery regiment';
    const ctaText = data.ctaText?.[currentLang] || data.ctaText?.['en'] || 'Join Now';
    
    const bgUrl = data.backgroundImageId 
        ? libraryApi.getFileUrl(data.backgroundImageId, 1920) 
        : '/home_background.jpg';

    const handleCtaClick = () => {
        if (data.ctaTargetId) {
            document.getElementById(data.ctaTargetId)?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <section className={`relative h-[80vh] min-h-[600px] flex items-center bg-nr-bg border-b border-nr-border overflow-hidden pointer-events-auto ${isEditMode ? 'rounded-lg' : ''}`}>
            {/* Background image overlay */}
            <div className="absolute inset-0 hero-overlay z-10" />
            <img
                src={bgUrl}
                alt="Hero Background"
                className="absolute inset-0 w-full h-full object-cover opacity-60"
            />

            <div className="relative z-20 max-w-7xl mx-auto px-4 w-full flex flex-col items-center md:items-start text-center md:text-left mt-20 animate-fade-in-up">
                {badgeText && (
                    <div className="inline-flex items-center rounded-full glass border border-nr-accent/20 px-4 py-1.5 text-sm font-bold text-nr-accent mb-6 shadow-sm dark:shadow-none transition-all">
                        <span>{badgeText}</span>
                    </div>
                )}
                <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] dark:drop-shadow-lg">
                    <span className="block text-gold-gradient">{titleMain}</span>
                    <span className="text-nr-text">{titleSub}</span>
                </h1>
                <p className="text-xl md:text-2xl text-nr-text/80 mb-10 max-w-2xl font-light">
                    {description}
                </p>
                <Button
                    variant="primary"
                    size="lg"
                    className="w-full md:w-auto flex justify-center items-center gap-2 font-bold shadow-lg shadow-amber-900/40 transform hover:scale-105"
                    onClick={handleCtaClick}
                >
                    <span>{ctaText}</span>
                    <Swords size={20} />
                </Button>
            </div>
        </section>
    );
};
