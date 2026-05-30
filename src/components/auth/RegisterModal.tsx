import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { authApi } from '../../api/authApi';
import { Mail, Eye, EyeOff } from 'lucide-react';
import { useResendVerification } from '../../hooks/useResendVerification';
import type { components } from '../../api/types';

type ValidationErrorResponse = components['schemas']['ValidationErrorResponse'];
type ErrorResponse = components['schemas']['ErrorResponse'];

interface RegisterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSwitchToLogin: () => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ isOpen, onClose, onSwitchToLogin }) => {
    const { t } = useTranslation();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [generalError, setGeneralError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const [needsVerification, setNeedsVerification] = useState(false);
    const [resendEmail, setResendEmail] = useState('');
    const { resend, status: resendStatus, countdown, errorMessage } = useResendVerification(resendEmail);

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

        setLoading(true);

        try {
            await authApi.register({ username, email, password });
            setSuccess(true);
        } catch (err: any) {
            const status = err.response?.status;
            const data = err.response?.data;

            if (status === 400 && data?.details) {
                const validationError = data as ValidationErrorResponse;
                setFieldErrors(validationError.details ?? {});
            } else if (status === 409) {
                const errorResponse = data as ErrorResponse;
                const code = errorResponse?.code;
                if (code === 'EMAIL_ALREADY_EXISTS') {
                    if (errorResponse?.metadata?.resendVerificationEmail === true) {
                        setNeedsVerification(true);
                        setResendEmail(email);
                    } else {
                        setFieldErrors({ email: t('error.EMAIL_ALREADY_EXISTS', { defaultValue: errorResponse.message }) });
                    }
                } else if (code === 'USERNAME_ALREADY_EXISTS') {
                    setFieldErrors({ username: t('error.USERNAME_ALREADY_EXISTS', { defaultValue: errorResponse.message }) });
                } else if (code) {
                    setGeneralError(t(`error.${code}`, { defaultValue: errorResponse.message }));
                } else {
                    setGeneralError(t('register.error_conflict'));
                }
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

    const handleClose = () => {
        setFieldErrors({});
        setGeneralError('');
        setUsername('');
        setEmail('');
        setPassword('');
        setShowPassword(false);
        setSuccess(false);
        setNeedsVerification(false);
        setResendEmail('');
        onClose();
    };

    const handleBackToLogin = () => {
        handleClose();
        onSwitchToLogin();
    };

    if (success) {
        return (
            <Modal isOpen={isOpen} onClose={handleClose} title={t('register.title')}>
                <div className="flex flex-col items-center text-center space-y-4 py-4">
                    <div className="w-16 h-16 rounded-full bg-nr-accent/15 flex items-center justify-center">
                        <Mail className="w-8 h-8 text-nr-accent" />
                    </div>
                    <h3 className="text-lg font-semibold text-nr-text">
                        {t('register.email_sent_title')}
                    </h3>
                    <p className="text-sm text-nr-text/70 leading-relaxed">
                        {t('register.email_sent_description')}
                    </p>
                    <Button
                        type="button"
                        variant="primary"
                        size="md"
                        className="w-full mt-2"
                        onClick={handleBackToLogin}
                    >
                        {t('register.back_to_login')}
                    </Button>
                </div>
            </Modal>
        );
    }

    if (needsVerification) {
        return (
            <Modal isOpen={isOpen} onClose={handleClose} title={t('register.needs_verification_title')}>
                <div className="flex flex-col items-center text-center space-y-4 py-4">
                    <div className="w-16 h-16 rounded-full bg-amber-500/15 flex items-center justify-center">
                        <Mail className="w-8 h-8 text-amber-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-nr-text">
                        {t('register.needs_verification_title')}
                    </h3>
                    <p className="text-sm text-nr-text/70 leading-relaxed">
                        {t('register.needs_verification_description')}
                    </p>

                    <div className="w-full space-y-3 pt-2">
                        <Button
                            type="button"
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

                    <Button
                        type="button"
                        variant="secondary"
                        size="md"
                        className="w-full mt-2"
                        onClick={handleBackToLogin}
                    >
                        {t('register.back_to_login')}
                    </Button>
                </div>
            </Modal>
        );
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={t('register.title')}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="register-username" className="block text-sm font-medium text-nr-text/70 mb-1.5">
                        {t('register.username')}
                    </label>
                    <input
                        id="register-username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        autoComplete="username"
                        className="w-full px-3 py-2.5 rounded-lg bg-nr-bg border border-nr-border text-nr-text placeholder-nr-text/40 focus:outline-none focus:ring-2 focus:ring-nr-accent/50 focus:border-nr-accent transition-colors"
                        placeholder={t('register.username')}
                    />
                    {fieldErrors.username && (
                        <p className="text-red-500 text-xs mt-1">{fieldErrors.username}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="register-email" className="block text-sm font-medium text-nr-text/70 mb-1.5">
                        {t('register.email')}
                    </label>
                    <input
                        id="register-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                        className="w-full px-3 py-2.5 rounded-lg bg-nr-bg border border-nr-border text-nr-text placeholder-nr-text/40 focus:outline-none focus:ring-2 focus:ring-nr-accent/50 focus:border-nr-accent transition-colors"
                        placeholder={t('register.email')}
                    />
                    {fieldErrors.email && (
                        <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="register-password" className="block text-sm font-medium text-nr-text/70 mb-1.5">
                        {t('register.password')}
                    </label>
                    <div className="relative">
                        <input
                            id="register-password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="new-password"
                            className="w-full pl-3 pr-10 py-2.5 rounded-lg bg-nr-bg border border-nr-border text-nr-text placeholder-nr-text/40 focus:outline-none focus:ring-2 focus:ring-nr-accent/50 focus:border-nr-accent transition-colors"
                            placeholder={t('register.password')}
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

                {generalError && (
                    <p className="text-red-500 text-sm text-center">{generalError}</p>
                )}

                <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="w-full"
                    disabled={loading}
                >
                    {loading ? '...' : t('register.submit')}
                </Button>

                <p className="text-center text-sm text-nr-text/60">
                    {t('register.have_account')}{' '}
                    <button
                        type="button"
                        onClick={handleBackToLogin}
                        className="text-nr-accent hover:text-nr-accent-hover underline underline-offset-2 transition-colors cursor-pointer"
                    >
                        {t('register.sign_in')}
                    </button>
                </p>
            </form>
        </Modal>
    );
};

export default RegisterModal;
