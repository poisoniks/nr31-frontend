import React, { useState } from 'react';
import { Database, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { adminApi } from '../../api/adminApi';
import { useUIStore } from '../../store/useUIStore';

const CacheResetPage: React.FC = () => {
    const { t } = useTranslation();
    const { setError } = useUIStore();
    const [isClearing, setIsClearing] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleClearCache = async () => {
        try {
            setIsClearing(true);
            setSuccess(false);
            await adminApi.clearCache();
            setSuccess(true);
            setTimeout(() => setSuccess(false), 5000);
        } catch (err: any) {
            console.error('Failed to clear cache:', err);
            setError(t('admin.cache.error'));
        } finally {
            setIsClearing(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-serif font-bold text-nr-text flex items-center gap-3">
                    <Database className="text-nr-accent" size={24} />
                    {t('admin.cache.title')}
                </h1>
                <p className="text-nr-text/60">{t('admin.cache.subtitle')}</p>
            </div>

            <div className="glass p-6 rounded-xl border border-nr-border/50 bg-white/5 dark:bg-black/20 backdrop-blur-md shadow-lg transition-transform md:hover:-translate-y-0.5 duration-300 max-w-2xl">
                <div className="flex items-start gap-4 mb-6 p-4 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-500">
                    <AlertTriangle className="flex-shrink-0 mt-0.5 text-amber-500" size={20} />
                    <div>
                        <h3 className="font-semibold mb-1 text-amber-500">{t('admin.cache.warning_title')}</h3>
                        <p className="text-sm opacity-90 leading-relaxed text-balance text-amber-500/90">
                            {t('admin.cache.warning_desc')}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={handleClearCache}
                        disabled={isClearing}
                        className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all duration-300 w-full md:w-auto cursor-pointer ${
                            isClearing 
                                ? 'bg-nr-accent/50 text-white cursor-not-allowed opacity-70' 
                                : 'bg-nr-accent hover:bg-nr-accent/90 text-black shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_20px_rgba(212,175,55,0.5)]'
                        }`}
                    >
                        {isClearing ? (
                            <Trash2 size={18} className="animate-pulse" />
                        ) : (
                            <Trash2 size={18} />
                        )}
                        {isClearing ? t('admin.cache.clearing') : t('admin.cache.clear_btn')}
                    </button>

                    {success && (
                        <span className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-medium animate-fade-in">
                            <CheckCircle size={16} />
                            {t('admin.cache.success')}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CacheResetPage;
