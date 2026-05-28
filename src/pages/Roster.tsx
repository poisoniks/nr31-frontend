import React from 'react';
import { Construction, Wrench } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';

const Roster: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-nr-bg min-h-[70vh] relative overflow-hidden font-interface">
            {/* Background decorative elements */}
            <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-nr-accent/5 rounded-full blur-3xl -z-10 animate-pulse duration-[6000ms]" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-nr-accent/5 rounded-full blur-3xl -z-10 animate-pulse duration-[8000ms]" />

            {/* Main glassmorphism card */}
            <div className="glass-card max-w-lg w-full p-8 md:p-12 rounded-2xl border border-nr-border shadow-2xl relative z-10 animate-fade-in-up flex flex-col items-center">
                
                {/* Visual Gear & Wrench Construction Indicator */}
                <div className="relative mb-8">
                  <div className="w-24 h-24 rounded-2xl bg-nr-accent/10 flex items-center justify-center border border-nr-accent/20 backdrop-blur-md">
                    <Construction className="text-nr-accent animate-pulse" size={48} />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-nr-surface rounded-full border border-nr-border flex items-center justify-center shadow-md animate-bounce">
                    <Wrench className="text-nr-accent" size={16} />
                  </div>
                </div>

                {/* Main Header with Serif font (Cinzel/Georgia) and Gold gradient */}
                <h1 className="text-4xl md:text-5xl font-header font-bold mb-4 tracking-tight">
                    <span className="text-gold-gradient">{t('maintenance.title')}</span>
                </h1>

                {/* Subtitle */}
                <h2 className="text-xl font-header font-bold text-nr-text/90 mb-4 uppercase tracking-wider">
                    {t('maintenance.subtitle')}
                </h2>

                {/* Divider */}
                <div className="w-16 h-1 bg-nr-accent/30 rounded-full mb-6"></div>

                {/* Description */}
                <p className="text-nr-text/60 mb-8 text-base md:text-lg leading-relaxed max-w-md font-interface">
                    {t('maintenance.description')}
                </p>

                {/* Actions */}
                <div className="flex gap-4 w-full sm:w-auto font-interface">
                    <Button 
                        onClick={() => navigate('/')} 
                        className="w-full sm:w-auto px-8 shadow-lg shadow-nr-accent/20 transition-all duration-300 hover:scale-[1.02]"
                    >
                        {t('maintenance.back_home')}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Roster;
