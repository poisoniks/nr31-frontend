import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { authApi } from '../../api/authApi';
import { useAuthStore } from '../../store/useAuthStore';
import { Eye, EyeOff, ArrowLeft, Mail } from 'lucide-react';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSwitchToRegister: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSwitchToRegister }) => {
    const { t } = useTranslation();
    const login = useAuthStore(state => state.login);

    const [view, setView] = useState<'login' | 'forgot' | 'forgot-sent'>('login');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotError, setForgotError] = useState('');
    const [forgotFieldErrors, setForgotFieldErrors] = useState<Record<string, string>>({});

    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await authApi.login({ username, password });
            login(response.accessToken, response.refreshToken);
            setUsername('');
            setPassword('');
            onClose();
        } catch (err: any) {
            if (err.response?.status === 401) {
                setError(t('login.error'));
            } else {
                setError(t('login.error'));
            }
        } finally {
            setLoading(false);
        }
    };

    const handleForgotSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setForgotError('');
        setForgotFieldErrors({});
        setLoading(true);

        try {
            await authApi.forgotPassword({ email: forgotEmail });
            setView('forgot-sent');
        } catch (err: any) {
            const status = err.response?.status;
            const data = err.response?.data;
            if (status === 400 && data?.details) {
                setForgotFieldErrors(data.details);
            } else if (data?.message) {
                setForgotError(data.message);
            } else {
                setForgotError(t('common.error.unexpected'));
            }
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setError('');
        setUsername('');
        setPassword('');
        setShowPassword(false);
        setView('login');
        setForgotEmail('');
        setForgotError('');
        setForgotFieldErrors({});
        onClose();
    };

    const handleSwitchToRegister = () => {
        handleClose();
        onSwitchToRegister();
    };

    const modalTitle = () => {
        if (view === 'forgot') {
            return (
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => {
                            setView('login');
                            setForgotError('');
                            setForgotFieldErrors({});
                        }}
                        className="p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 text-nr-text/60 hover:text-nr-text transition-colors cursor-pointer"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <span>{t('forgot_password.title')}</span>
                </div>
            );
        }
        if (view === 'forgot-sent') {
            return t('forgot_password.sent_title');
        }
        return t('login.title');
    };

    if (view === 'forgot') {
        return (
            <Modal isOpen={isOpen} onClose={handleClose} title={modalTitle()}>
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="forgot-email" className="block text-sm font-medium text-nr-text/70 mb-1.5">
                            {t('forgot_password.email')}
                        </label>
                        <input
                            id="forgot-email"
                            type="email"
                            value={forgotEmail}
                            onChange={(e) => setForgotEmail(e.target.value)}
                            required
                            autoComplete="email"
                            className="w-full px-3 py-2.5 rounded-lg bg-nr-bg border border-nr-border text-nr-text placeholder-nr-text/40 focus:outline-none focus:ring-2 focus:ring-nr-accent/50 focus:border-nr-accent transition-colors"
                            placeholder={t('forgot_password.email')}
                        />
                        {forgotFieldErrors.email && (
                            <p className="text-red-500 text-xs mt-1">{forgotFieldErrors.email}</p>
                        )}
                    </div>

                    {forgotError && (
                        <p className="text-red-500 text-sm text-center">{forgotError}</p>
                    )}

                    <Button
                        type="submit"
                        variant="primary"
                        size="md"
                        className="w-full"
                        disabled={loading}
                    >
                        {loading ? '...' : t('forgot_password.submit')}
                    </Button>

                    <p className="text-center text-sm text-nr-text/60">
                        <button
                            type="button"
                            onClick={() => {
                                setView('login');
                                setForgotError('');
                                setForgotFieldErrors({});
                            }}
                            className="text-nr-accent hover:text-nr-accent-hover underline underline-offset-2 transition-colors cursor-pointer animate-fade-in"
                        >
                            {t('forgot_password.back')}
                        </button>
                    </p>
                </form>
            </Modal>
        );
    }

    if (view === 'forgot-sent') {
        return (
            <Modal isOpen={isOpen} onClose={handleClose} title={modalTitle()}>
                <div className="flex flex-col items-center text-center space-y-4 py-4 animate-fade-in">
                    <div className="w-16 h-16 rounded-full bg-nr-accent/15 flex items-center justify-center">
                        <Mail className="w-8 h-8 text-nr-accent animate-pulse" />
                    </div>
                    <h3 className="text-lg font-semibold text-nr-text">
                        {t('forgot_password.sent_title')}
                    </h3>
                    <p className="text-sm text-nr-text/70 leading-relaxed">
                        {t('forgot_password.sent_description')}
                    </p>
                    <Button
                        type="button"
                        variant="primary"
                        size="md"
                        className="w-full mt-2"
                        onClick={() => {
                            setView('login');
                            setForgotEmail('');
                            setForgotError('');
                            setForgotFieldErrors({});
                        }}
                    >
                        {t('register.back_to_login')}
                    </Button>
                </div>
            </Modal>
        );
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={t('login.title')}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="login-username" className="block text-sm font-medium text-nr-text/70 mb-1.5">
                        {t('login.username')}
                    </label>
                    <input
                        id="login-username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        autoComplete="username"
                        className="w-full px-3 py-2.5 rounded-lg bg-nr-bg border border-nr-border text-nr-text placeholder-nr-text/40 focus:outline-none focus:ring-2 focus:ring-nr-accent/50 focus:border-nr-accent transition-colors"
                        placeholder={t('login.username')}
                    />
                </div>

                <div>
                    <label htmlFor="login-password" className="block text-sm font-medium text-nr-text/70 mb-1.5">
                        {t('login.password')}
                    </label>
                    <div className="relative">
                        <input
                            id="login-password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                            className="w-full pl-3 pr-10 py-2.5 rounded-lg bg-nr-bg border border-nr-border text-nr-text placeholder-nr-text/40 focus:outline-none focus:ring-2 focus:ring-nr-accent/50 focus:border-nr-accent transition-colors"
                            placeholder={t('login.password')}
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
                    <div className="flex justify-end mt-1.5">
                        <button
                            type="button"
                            onClick={() => {
                                setView('forgot');
                                setError('');
                            }}
                            className="text-xs text-nr-accent hover:text-nr-accent-hover transition-colors cursor-pointer"
                        >
                            {t('login.forgot_password')}
                        </button>
                    </div>
                </div>

                {error && (
                    <p className="text-red-500 text-sm text-center">{error}</p>
                )}

                <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="w-full"
                    disabled={loading}
                >
                    {loading ? '...' : t('login.submit')}
                </Button>

                <p className="text-center text-sm text-nr-text/60">
                    {t('login.not_registered')}{' '}
                    <button
                        type="button"
                        onClick={handleSwitchToRegister}
                        className="text-nr-accent hover:text-nr-accent-hover underline underline-offset-2 transition-colors cursor-pointer"
                    >
                        {t('login.register_link')}
                    </button>
                </p>
            </form>
        </Modal>
    );
};

export default LoginModal;
