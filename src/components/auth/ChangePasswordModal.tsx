import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { authApi } from '../../api/authApi';
import { Eye, EyeOff, CheckCircle } from 'lucide-react';
import type { components } from '../../api/types';

type ValidationErrorResponse = components['schemas']['ValidationErrorResponse'];

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [generalError, setGeneralError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFieldErrors({});
        setGeneralError('');

        // Front-end validations
        const errors: Record<string, string> = {};

        if (!currentPassword.trim()) {
            errors.currentPassword = t('register.validation.password.required');
        }

        if (!newPassword.trim()) {
            errors.newPassword = t('register.validation.password.required');
        } else if (newPassword.length < 8) {
            errors.newPassword = t('register.validation.password.min_length');
        } else {
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;
            if (!passwordRegex.test(newPassword)) {
                errors.newPassword = t('register.validation.password.pattern');
            }
        }

        if (newPassword !== confirmPassword) {
            errors.confirmPassword = t('reset_password.validation.passwords_mismatch');
        }

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        setLoading(true);

        try {
            await authApi.changePassword({ currentPassword, newPassword });
            setSuccess(true);
        } catch (err: any) {
            const status = err.response?.status;
            const data = err.response?.data;

            if (status === 400 && data?.details) {
                const validationError = data as ValidationErrorResponse;
                setFieldErrors(validationError.details ?? {});
            } else if (status === 401 || data?.code === 'BAD_CREDENTIALS') {
                // Invalid current password
                setFieldErrors({ currentPassword: t('profile.error.invalid_current_password', { defaultValue: 'Invalid current password' }) });
            } else if (status === 409 || data?.code === 'CONFLICT') {
                // Same password conflict
                setFieldErrors({ newPassword: t('profile.error.same_password', { defaultValue: 'New password cannot be the same as the old password' }) });
            } else if (data?.code) {
                setGeneralError(t(`error.${data.code}`, { defaultValue: data.message }));
            } else {
                setGeneralError(t('common.error.unexpected'));
            }
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
        setFieldErrors({});
        setGeneralError('');
        setSuccess(false);
        onClose();
    };

    if (success) {
        return (
            <Modal isOpen={isOpen} onClose={handleClose} title={t('profile.change_password_title')}>
                <div className="flex flex-col items-center text-center space-y-4 py-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center">
                        <CheckCircle className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-nr-text">
                        {t('profile.change_password_success')}
                    </h3>
                    <Button
                        type="button"
                        variant="primary"
                        size="md"
                        className="w-full mt-2"
                        onClick={handleClose}
                    >
                        {t('common.go_back')}
                    </Button>
                </div>
            </Modal>
        );
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={t('profile.change_password_title')}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="current-password" className="block text-sm font-medium text-nr-text/70 mb-1.5">
                        {t('profile.current_password')}
                    </label>
                    <div className="relative">
                        <input
                            id="current-password"
                            type={showCurrentPassword ? 'text' : 'password'}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                            className="w-full pl-3 pr-10 py-2.5 rounded-lg bg-nr-bg border border-nr-border text-nr-text placeholder-nr-text/40 focus:outline-none focus:ring-2 focus:ring-nr-accent/50 focus:border-nr-accent transition-colors"
                            placeholder={t('profile.current_password')}
                        />
                        <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-nr-text/40 hover:text-nr-text/70 focus:outline-none transition-colors cursor-pointer"
                        >
                            {showCurrentPassword ? (
                                <EyeOff className="w-5 h-5" />
                            ) : (
                                <Eye className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                    {fieldErrors.currentPassword && (
                        <p className="text-red-500 text-xs mt-1">{fieldErrors.currentPassword}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="new-password" className="block text-sm font-medium text-nr-text/70 mb-1.5">
                        {t('profile.new_password')}
                    </label>
                    <div className="relative">
                        <input
                            id="new-password"
                            type={showNewPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            className="w-full pl-3 pr-10 py-2.5 rounded-lg bg-nr-bg border border-nr-border text-nr-text placeholder-nr-text/40 focus:outline-none focus:ring-2 focus:ring-nr-accent/50 focus:border-nr-accent transition-colors"
                            placeholder={t('profile.new_password')}
                        />
                        <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-nr-text/40 hover:text-nr-text/70 focus:outline-none transition-colors cursor-pointer"
                        >
                            {showNewPassword ? (
                                <EyeOff className="w-5 h-5" />
                            ) : (
                                <Eye className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                    {fieldErrors.newPassword && (
                        <p className="text-red-500 text-xs mt-1">{fieldErrors.newPassword}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="confirm-password" className="block text-sm font-medium text-nr-text/70 mb-1.5">
                        {t('profile.confirm_password')}
                    </label>
                    <div className="relative">
                        <input
                            id="confirm-password"
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="w-full pl-3 pr-10 py-2.5 rounded-lg bg-nr-bg border border-nr-border text-nr-text placeholder-nr-text/40 focus:outline-none focus:ring-2 focus:ring-nr-accent/50 focus:border-nr-accent transition-colors"
                            placeholder={t('profile.confirm_password')}
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
                    <p className="text-red-500 text-sm text-center">{generalError}</p>
                )}

                <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="w-full"
                    disabled={loading}
                >
                    {loading ? '...' : t('profile.change_password_submit')}
                </Button>
            </form>
        </Modal>
    );
};

export default ChangePasswordModal;
