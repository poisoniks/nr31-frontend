import React from 'react';
import { FileQuestion } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';

const StaticErrorPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-fade-in bg-nr-bg">
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-2xl bg-nr-accent/10 flex items-center justify-center border border-nr-accent/20 backdrop-blur-md animate-pulse">
          <FileQuestion className="text-nr-accent" size={48} />
        </div>
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full border-4 border-nr-bg animate-bounce" />
      </div>

      <h1 className="text-5xl font-serif font-bold text-nr-text mb-4 tracking-tight">
        {t('error.page_not_found')}
      </h1>

      <p className="text-nr-text/60 max-w-md mb-10 text-lg leading-relaxed">
        {t('error.page_not_found_desc')}
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button variant="secondary" onClick={() => navigate(-1)} className="px-8">
          {t('common.go_back')}
        </Button>
        <Button onClick={() => navigate('/')} className="px-8 shadow-lg shadow-nr-accent/20">
          {t('error.return_home')}
        </Button>
      </div>
      
      {/* Decorative background elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-nr-accent/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-nr-accent/5 rounded-full blur-3xl -z-10" />
    </div>
  );
};

export default StaticErrorPage;
