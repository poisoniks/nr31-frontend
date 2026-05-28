import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle, XCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import Button from '../components/ui/Button';
import { authApi } from '../api/authApi';
import type { components } from '../api/types';

type ValidationErrorResponse = components['schemas']['ValidationErrorResponse'];
type ErrorResponse = components['schemas']['ErrorResponse'];

type ResetState = 'form' | 'success' | 'error';

const ResetPassword = () => {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Store the token in local state on mount so it's not lost when we clean URL
    const [token] = useState(() => searchParams.get('token') || '');
    const [state, setState] = useState<ResetState>(() => token ? 'form' : 'error');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [generalError, setGeneralError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Clean URL to remove token query parameter
        if (searchParams.get('token')) {
            navigate('/reset-password', { replace: true });
        }
    }, [navigate, searchParams]);

    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFieldErrors({});
        setGeneralError('');

        if (!password.trim()) {
            setFieldErrors({ password: t('register.validation.password.required') });
            return;
        }
        if (password.length < 8) {
            setFieldErrors({ password: t('register.validation.password.min_length') });
            return;
        }
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;
        if (!passwordRegex.test(password)) {
            setFieldErrors({ password: t('register.validation.password.pattern') });
            return;
        }
        if (password !== confirmPassword) {
            setFieldErrors({ confirmPassword: t('reset_password.validation.passwords_mismatch') });
            return;
        }

        setLoading(true);

        try {
            await authApi.resetPassword({ token, newPassword: password });
            setState('success');
        } catch (err: any) {
            const status = err.response?.status;
            const data = err.response?.data;

            if (status === 400 && data?.details) {
                const validationError = data as ValidationErrorResponse;
                setFieldErrors(validationError.details ?? {});
            } else if (data?.code) {
                const errorResponse = data as ErrorResponse;
                setGeneralError(t(`error.${errorResponse.code}`, { defaultValue: errorResponse.message }));
            } else {
                setGeneralError(t('common.error.unexpected'));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 flex items-center justify-center px-4 py-24 bg-nr-bg-tint">
            <div className="glass-card rounded-xl p-8 max-w-md w-full text-center space-y-6">
                {state === 'success' && (
                    <>
                        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/15 flex items-center justify-center">
                            <CheckCircle className="w-8 h-8 text-emerald-500 animate-bounce" />
                        </div>
                        <h1 className="text-xl font-serif font-bold text-nr-text">
                            {t('reset_password.success_title')}
                        </h1>
                        <p className="text-sm text-nr-text/70 leading-relaxed">
                            {t('reset_password.success_description')}
                        </p>
                        <Link to="/">
                            <Button variant="primary" size="md" className="w-full">
                                {t('reset_password.go_home')}
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
                            {t('reset_password.error_title')}
                        </h1>
                        <p className="text-sm text-nr-text/70 leading-relaxed">
                            {!token ? t('reset_password.no_token') : t('reset_password.error_description')}
                        </p>
                        <Link to="/">
                            <Button variant="primary" size="md" className="w-full">
                                {t('reset_password.go_home')}
                            </Button>
                        </Link>
                    </>
                )}

                {state === 'form' && (
                    <div className="text-left space-y-4">
                        <h1 className="text-2xl font-serif font-bold text-nr-text text-center">
                            {t('reset_password.title')}
                        </h1>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="reset-password" className="block text-sm font-medium text-nr-text/70 mb-1.5">
                                    {t('reset_password.new_password')}
                                </label>
                                <div className="relative">
                                    <input
                                        id="reset-password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        autoComplete="new-password"
                                        className="w-full pl-3 pr-10 py-2.5 rounded-lg bg-nr-bg border border-nr-border text-nr-text placeholder-nr-text/40 focus:outline-none focus:ring-2 focus:ring-nr-accent/50 focus:border-nr-accent transition-colors"
                                        placeholder={t('reset_password.new_password')}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-nr-text/40 hover:text-nr-text/70 focus:outline-none transition-colors cursor-pointer"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                                {fieldErrors.password && (
                                    <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="confirm-password" className="block text-sm font-medium text-nr-text/70 mb-1.5">
                                    {t('reset_password.confirm_password')}
                                </label>
                                <div className="relative">
                                    <input
                                        id="confirm-password"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        autoComplete="new-password"
                                        className="w-full pl-3 pr-10 py-2.5 rounded-lg bg-nr-bg border border-nr-border text-nr-text placeholder-nr-text/40 focus:outline-none focus:ring-2 focus:ring-nr-accent/50 focus:border-nr-accent transition-colors"
                                        placeholder={t('reset_password.confirm_password')}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-nr-text/40 hover:text-nr-text/70 focus:outline-none transition-colors cursor-pointer"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                                {fieldErrors.confirmPassword && (
                                    <p className="text-red-500 text-xs mt-1">{fieldErrors.confirmPassword}</p>
                                )}
                            </div>

                            {generalError && (
                                <p className="text-red-500 text-sm text-center font-medium">{generalError}</p>
                            )}

                            <Button
                                type="submit"
                                variant="primary"
                                size="md"
                                className="w-full flex items-center justify-center"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        ...
                                    </>
                                ) : (
                                    t('reset_password.submit')
                                )}
                            </Button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;
