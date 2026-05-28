import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { authApi } from '../api/authApi';
import ChangePasswordModal from '../components/auth/ChangePasswordModal';
import Button from '../components/ui/Button';
import { User, Shield } from 'lucide-react';
import type { components } from '../api/types';

type UserDTO = components['schemas']['UserDTO'];

const Profile: React.FC = () => {
    const { t, i18n } = useTranslation();
    const [profileUser, setProfileUser] = useState<UserDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await authApi.getCurrentUser();
                setProfileUser(data);
            } catch (err: any) {
                console.error(err);
                setError(t('common.error.unexpected'));
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [t]);

    if (loading) {
        return (
            <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 mt-16 flex flex-col">
                <div className="w-full flex-1 glass-card rounded-xl p-8 animate-pulse space-y-6 border border-nr-border/60 flex flex-col">
                    <div className="h-8 bg-nr-border/20 rounded w-1/3 mb-6"></div>
                    <div className="flex-1 bg-nr-border/20 rounded-lg"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 mt-16 text-center">
                <p className="text-red-500 font-medium">{error}</p>
            </div>
        );
    }

    if (!profileUser) {
        return null;
    }

    return (
        <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 mt-16 flex flex-col">
            <h1 className="text-3xl font-serif font-bold text-nr-text mb-6">
                {t('profile.title')}
            </h1>

            <div className="w-full flex-1 glass-card rounded-xl p-6 md:p-8 border border-nr-border/60 flex flex-col">
                <div className="space-y-6 flex-1">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-nr-accent/15 flex items-center justify-center border border-nr-accent/20">
                            <User className="w-8 h-8 text-nr-accent" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-nr-text font-serif">
                                {profileUser.username}
                            </h2>
                        </div>
                    </div>

                    <div className="border-t border-nr-border/60 pt-6">
                        <h3 className="text-sm font-bold text-nr-text/50 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                            <Shield className="w-4 h-4 text-nr-accent" />
                            {t('profile.roles')}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {profileUser.roles && profileUser.roles.length > 0 ? (
                                profileUser.roles.map((role) => {
                                    const displayName = role.localizedName?.[i18n.language] || role.name;
                                    return (
                                        <span
                                            key={role.id}
                                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-nr-accent/10 border border-nr-accent/20 text-nr-accent"
                                        >
                                            {displayName}
                                        </span>
                                    );
                                })
                            ) : (
                                <span className="text-sm text-nr-text/50 italic">
                                    {t('profile.no_roles')}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="border-t border-nr-border/60 pt-6 flex justify-end mt-auto">
                    <Button
                        type="button"
                        variant="primary"
                        onClick={() => setIsPasswordModalOpen(true)}
                    >
                        {t('profile.change_password')}
                    </Button>
                </div>
            </div>

            <ChangePasswordModal
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
            />
        </div>
    );
};

export default Profile;
