import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { authApi } from '../../api/authApi';
import { useAuthStore } from '../../store/useAuthStore';
import { Eye, EyeOff } from 'lucide-react';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSwitchToRegister: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSwitchToRegister }) => {
    const { t } = useTranslation();
    const login = useAuthStore(state => state.login);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

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

    const handleClose = () => {
        setError('');
        setUsername('');
        setPassword('');
        setShowPassword(false);
        onClose();
    };

    const handleSwitchToRegister = () => {
        handleClose();
        onSwitchToRegister();
    };

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
