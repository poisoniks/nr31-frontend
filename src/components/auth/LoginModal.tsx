import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { authApi } from '../../api/authApi';
import { useAuthStore } from '../../store/useAuthStore';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const login = useAuthStore(state => state.login);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
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
        onClose();
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
                    <input
                        id="login-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                        className="w-full px-3 py-2.5 rounded-lg bg-nr-bg border border-nr-border text-nr-text placeholder-nr-text/40 focus:outline-none focus:ring-2 focus:ring-nr-accent/50 focus:border-nr-accent transition-colors"
                        placeholder={t('login.password')}
                    />
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
            </form>
        </Modal>
    );
};

export default LoginModal;
