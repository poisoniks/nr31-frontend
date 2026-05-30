import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';

const AccessDenied: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
      <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6 border border-red-500/20">
        <ShieldAlert className="text-red-500" size={40} />
      </div>

      <h1 className="text-4xl font-serif font-bold text-nr-text mb-4 tracking-tight">
        {t('common.access_denied')}
      </h1>

      <p className="text-nr-text/60 max-w-md mb-8 text-lg">
        {t('common.access_denied_desc')}
      </p>

      <div className="flex gap-4">
        <Button variant="secondary" onClick={() => navigate(-1)}>
          {t('common.go_back')}
        </Button>
        <Button onClick={() => navigate('/')}>
          {t('header.home')}
        </Button>
      </div>
    </div>
  );
};

export default AccessDenied;
