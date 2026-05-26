import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { authApi } from '../api/authApi';
import type { components } from '../api/types';

type ErrorResponse = components['schemas']['ErrorResponse'];

export const useResendVerification = (email: string) => {
    const { t } = useTranslation();
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [countdown, setCountdown] = useState(0);
    const [errorMessage, setErrorMessage] = useState('');
    const intervalRef = useRef<number | null>(null);

    const startCountdown = (seconds: number) => {
        setCountdown(seconds);
        if (intervalRef.current) window.clearInterval(intervalRef.current);
        intervalRef.current = window.setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    if (intervalRef.current) window.clearInterval(intervalRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    useEffect(() => {
        return () => {
            if (intervalRef.current) window.clearInterval(intervalRef.current);
        };
    }, []);

    const resend = async () => {
        if (!email || countdown > 0) return;
        
        setStatus('loading');
        setErrorMessage('');

        try {
            await authApi.resendVerification({ email });
            setStatus('success');
        } catch (err: any) {
            const statusCode = err.response?.status;
            const data = err.response?.data as ErrorResponse;

            if (statusCode === 429) {
                const remainingSeconds = typeof data?.metadata?.remainingSeconds === 'number' 
                    ? data.metadata.remainingSeconds 
                    : 60; // fallback
                startCountdown(remainingSeconds);
                setStatus('idle');
            } else {
                setStatus('error');
                setErrorMessage(t('resend.error'));
            }
        }
    };

    return { resend, status, countdown, errorMessage };
};
