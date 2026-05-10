import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cmsApi } from '../../api/cmsApi';
import type { DiscordWidgetDataDto } from '../../api/cmsApi';

interface DiscordWidgetProps {
    inviteCode: string;
}

const DiscordWidget: React.FC<DiscordWidgetProps> = ({ inviteCode }) => {
    const { t } = useTranslation();
    const [discordData, setDiscordData] = useState<DiscordWidgetDataDto | null>(null);

    useEffect(() => {
        if (!inviteCode) return;
        cmsApi.getDiscordWidgetData(inviteCode)
            .then(data => setDiscordData(data))
            .catch(console.error);
    }, [inviteCode]);

    if (!discordData) {
        return (
            <div className="flex items-center justify-center bg-transparent text-nr-text w-full h-full min-h-[300px] font-sans text-sm border border-nr-border/50 rounded-xl">
                <div className="w-8 h-8 border-4 border-nr-accent border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const { logoUrl, serverName, presenceCount, topGames = [], displayMembers = [], moreCount, inviteUrl } = discordData;

    return (
        <div className="flex flex-col bg-transparent text-nr-text w-full h-full font-sans text-sm transition-colors duration-200 border border-nr-border/50 rounded-xl overflow-hidden pointer-events-auto">
            {/* Header */}
            <div className="flex flex-col border-b border-nr-border/50 p-4 shrink-0 transition-colors duration-200">
                <div className="flex items-center gap-3">
                    {logoUrl ? (
                        <img src={logoUrl} alt="Server Logo" className="w-12 h-12 rounded-2xl object-cover shadow-sm bg-black/10 dark:bg-black/40 border border-nr-border/50 transition-colors duration-200" />
                    ) : (
                        <div className="w-12 h-12 rounded-2xl bg-black/10 dark:bg-black/40 flex items-center justify-center text-xs font-bold shrink-0 border border-nr-border/50 text-nr-text transition-colors duration-200">
                            ЄУК
                        </div>
                    )}
                    <div className="flex flex-col min-w-0">
                        <span className="font-bold text-nr-text truncate text-base drop-shadow-sm transition-colors duration-200">{serverName}</span>
                        <span className="text-xs text-nr-text/70 flex items-center gap-1.5 mt-0.5 transition-colors duration-200">
                            <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_4px_#22c55e]"></span>
                            <span className="font-medium text-nr-text transition-colors duration-200">{presenceCount}</span> {t('discord.members_online')}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar min-h-[250px]">
                {/* Top Games Section */}
                {topGames.length > 0 && (
                    <div className="mb-4">
                        <span className="text-xs font-bold uppercase text-nr-text/60 mb-2 block transition-colors duration-200">{t('discord.currently_playing')}</span>
                        <div className="flex flex-wrap gap-2 text-xs">
                            {topGames.map((game: string) => (
                                <div key={game} className="bg-black/5 dark:bg-black/20 border border-nr-border/50 shadow-sm px-2.5 py-1.5 rounded-md text-nr-text/80 max-w-full truncate font-medium transition-colors duration-200" title={game}>
                                    {game}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Members List */}
                <div className="space-y-0.5">
                    {displayMembers.map((member: any) => (
                        <div key={member.id} className="flex items-center gap-3 py-1.5 px-2 -mx-2 hover:bg-black/5 dark:hover:bg-white/5 rounded cursor-pointer transition-colors duration-200 group">
                            <div className="relative shrink-0">
                                <img src={member.avatarUrl} alt={member.username} className="w-8 h-8 rounded-full bg-black/10 dark:bg-black/40 object-cover transition-colors duration-200" />
                                <div className={`absolute -bottom-[2px] -right-[2px] w-[14px] h-[14px] border-[2.5px] border-nr-bg group-hover:border-nr-bg rounded-full flex items-center justify-center transition-colors duration-200
                                    ${member.status === 'online' ? 'bg-green-500' : member.status === 'idle' ? 'bg-amber-500' : 'bg-red-500'}`}>
                                </div>
                            </div>
                            <div className="flex flex-col overflow-hidden leading-snug w-full">
                                <span className="text-nr-text truncate group-hover:text-nr-accent transition-colors duration-200">{member.username}</span>
                                {member.game && (
                                    <span className="text-[10px] text-nr-text/60 truncate overflow-hidden block w-full transition-colors duration-200">
                                        Playing <strong className="font-semibold text-nr-text/80 transition-colors duration-200">{member.game}</strong>
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* More count */}
                    {moreCount !== undefined && moreCount > 0 && (
                        <div className="text-xs text-nr-text/60 py-2 px-1 font-medium italic transition-colors duration-200">
                            {t('discord.more_players', { count: moreCount })}
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Connect Button */}
            <div className="p-3 bg-black/5 dark:bg-black/20 shrink-0 border-t border-nr-border/50 transition-colors duration-200">
                <a
                    href={inviteUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex justify-center items-center w-full py-2.5 bg-[#5865F2] hover:bg-[#4752C4] shadow-md shadow-[#5865F2]/20 hover:shadow-[#5865F2]/40 text-white font-medium rounded transition-all transform hover:-translate-y-0.5"
                >
                    {t('discord.join')}
                </a>
            </div>
        </div>
    );
};

export default DiscordWidget;
