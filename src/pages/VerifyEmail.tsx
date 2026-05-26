import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle, XCircle, Loader2, Clock } from 'lucide-react';
import Button from '../components/ui/Button';
import { authApi } from '../api/authApi';
import { useResendVerification } from '../hooks/useResendVerification';
import type { components } from '../api/types';

type ErrorResponse = components['schemas']['ErrorResponse'];
type VerifyState = 'loading' | 'success' | 'error' | 'expired';

const VerifyEmail = () => {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [state, setState] = useState<VerifyState>('loading');
    const calledRef = useRef(false);

    const [email] = useState(() => searchParams.get('email') || '');
    
    const { resend, status: resendStatus, countdown, errorMessage } = useResendVerification(email);

    useEffect(() => {
        if (calledRef.current) return;

        const token = searchParams.get('token');

        if (!token) {
            setState('error');
            return;
        }

        calledRef.current = true;
        navigate('/verify-email', { replace: true });

        authApi.verifyEmail(token)
            .then(() => setState('success'))
            .catch((err: any) => {
                const data = err.response?.data as ErrorResponse;
                if (data?.code === 'TOKEN_EXPIRED' && email) {
                    setState('expired');
                } else {
                    setState('error');
                }
            });
    }, [searchParams, navigate, email]);

    return (
        <div className="flex-1 flex items-center justify-center px-4 py-24">
            <div className="glass-card rounded-xl p-8 max-w-md w-full text-center space-y-6">
                {state === 'loading' && (
                    <>
                        <div className="w-16 h-16 mx-auto rounded-full bg-nr-accent/15 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-nr-accent animate-spin" />
                        </div>
                        <h1 className="text-xl font-serif font-bold text-nr-text">
                            {t('verify_email.loading')}
                        </h1>
                    </>
                )}

                {state === 'success' && (
                    <>
                        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/15 flex items-center justify-center">
                            <CheckCircle className="w-8 h-8 text-emerald-500" />
                        </div>
                        <h1 className="text-xl font-serif font-bold text-nr-text">
                            {t('verify_email.success_title')}
                        </h1>
                        <p className="text-sm text-nr-text/70 leading-relaxed">
                            {t('verify_email.success_description')}
                        </p>
                        <Link to="/">
                            <Button variant="primary" size="md" className="w-full">
                                {t('verify_email.go_home')}
                            </Button>
                        </Link>
                    </>
                )}

                {state === 'error' && (
                    <>
                        <div className="w-16 h-16 mx-auto rounded-full bg-red-500/15 flex items-center justify-center">
                            <XCircle className="w-8 h-8 text-red-500" />
                        </div>
                        <h1 className="text-xl font-serif font-bold text-nr-text">
                            {t('verify_email.error_title')}
                        </h1>
                        <p className="text-sm text-nr-text/70 leading-relaxed">
                            {t('verify_email.error_description')}
                        </p>
                        <Link to="/">
                            <Button variant="primary" size="md" className="w-full">
                                {t('verify_email.go_home')}
                            </Button>
                        </Link>
                    </>
                )}

                {state === 'expired' && (
                    <>
                        <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/15 flex items-center justify-center">
                            <Clock className="w-8 h-8 text-amber-500" />
                        </div>
                        <h1 className="text-xl font-serif font-bold text-nr-text">
                            {t('verify_email.expired_title')}
                        </h1>
                        <p className="text-sm text-nr-text/70 leading-relaxed">
                            {t('verify_email.expired_description')}
                        </p>

                        <div className="space-y-3 pt-2">
                            <Button 
                                variant="primary" 
                                size="md" 
                                className="w-full"
                                onClick={resend}
                                disabled={resendStatus === 'loading' || countdown > 0 || resendStatus === 'success'}
                            >
                                {resendStatus === 'loading' ? '...' : 
                                 countdown > 0 ? t('resend.button_countdown', { seconds: countdown }) :
                                 t('resend.button')}
                            </Button>

                            {resendStatus === 'success' && (
                                <p className="text-emerald-500 text-sm font-medium">
                                    {t('resend.success')}
                                </p>
                            )}

                            {errorMessage && (
                                <p className="text-red-500 text-sm font-medium">
                                    {errorMessage}
                                </p>
                            )}
                        </div>

                        <Link to="/" className="block mt-4">
                            <Button variant="secondary" size="md" className="w-full">
                                {t('verify_email.go_home')}
                            </Button>
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;
