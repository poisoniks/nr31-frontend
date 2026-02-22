import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface DiscordMember {
    id: string;
    username: string;
    discriminator: string;
    avatar: string | null;
    status: 'online' | 'idle' | 'dnd';
    avatar_url: string;
    game?: { name: string };
    channel_id?: string;
}

interface DiscordData {
    id: string;
    name: string;
    members: DiscordMember[];
    presence_count: number;
}

const DiscordWidget: React.FC = () => {
    const { t } = useTranslation();
    const [logoUrl, setLogoUrl] = useState<string>('');
    const [discordData, setDiscordData] = useState<DiscordData | null>(null);

    useEffect(() => {
        fetch('https://discord.com/api/invites/uuc')
            .then(res => res.json())
            .then(data => {
                if (data?.guild?.icon) {
                    setLogoUrl(`https://cdn.discordapp.com/icons/454665524400619535/${data.guild.icon}.png`);
                }
            })
            .catch(console.error);

        fetch('https://discord.com/api/guilds/454665524400619535/widget.json')
            .then(res => res.json())
            .then(data => setDiscordData(data))
            .catch(console.error);
    }, []);

    if (!discordData) {
        return (
            <div className="flex items-center justify-center bg-transparent text-nr-text w-full h-full font-sans text-sm">
                <div className="w-8 h-8 border-4 border-nr-accent border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const gameCounts: Record<string, number> = {};
    if (discordData.members) {
        discordData.members.forEach(m => {
            if (m.game?.name) {
                gameCounts[m.game.name] = (gameCounts[m.game.name] || 0) + 1;
            }
        });
    }

    const topGames = Object.entries(gameCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(entry => entry[0]);

    const sortedMembers = [...(discordData.members || [])].sort((a, b) => {
        const aScore = (a.game ? 2 : 0) + (a.channel_id ? 1 : 0);
        const bScore = (b.game ? 2 : 0) + (b.channel_id ? 1 : 0);
        return bScore - aScore;
    });

    const displayMembers = sortedMembers.slice(0, 15);
    const moreCount = Math.max(0, discordData.presence_count - 15);

    return (
        <div className="flex flex-col bg-transparent text-nr-text w-full h-full font-sans text-sm transition-colors duration-200">
            {/* Header */}
            <div className="flex flex-col border-b border-nr-border/50 p-4 shrink-0 transition-colors duration-200">
                <div className="flex items-center gap-3">
                    {logoUrl ? (
                        <img src={logoUrl} alt="Server Logo" className="w-12 h-12 rounded-2xl object-cover shadow-sm bg-black/10 dark:bg-black/40 border border-nr-border/50 transition-colors duration-200" />
                    ) : (
                        <div className="w-12 h-12 rounded-2xl bg-black/10 dark:bg-black/40 flex items-center justify-center text-xs font-bold shrink-0 border border-nr-border/50 text-nr-text transition-colors duration-200">
                            NR31
                        </div>
                    )}
                    <div className="flex flex-col min-w-0">
                        <span className="font-bold text-nr-text truncate text-base drop-shadow-sm transition-colors duration-200">{discordData.name}</span>
                        <span className="text-xs text-nr-text/70 flex items-center gap-1.5 mt-0.5 transition-colors duration-200">
                            <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_4px_#22c55e]"></span>
                            <span className="font-medium text-nr-text transition-colors duration-200">{discordData.presence_count}</span> {t('discord.members_online')}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {/* Top Games Section */}
                {topGames.length > 0 && (
                    <div className="mb-4">
                        <span className="text-xs font-bold uppercase text-nr-text/60 mb-2 block transition-colors duration-200">{t('discord.currently_playing')}</span>
                        <div className="flex flex-wrap gap-2 text-xs">
                            {topGames.map(game => (
                                <div key={game} className="bg-black/5 dark:bg-black/20 border border-nr-border/50 shadow-sm px-2.5 py-1.5 rounded-md text-nr-text/80 max-w-full truncate font-medium transition-colors duration-200" title={game}>
                                    {game}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Members List */}
                <div className="space-y-0.5">
                    {displayMembers.map(member => (
                        <div key={member.id} className="flex items-center gap-3 py-1.5 px-2 -mx-2 hover:bg-black/5 dark:hover:bg-white/5 rounded cursor-pointer transition-colors duration-200 group">
                            <div className="relative shrink-0">
                                <img src={member.avatar_url} alt={member.username} className="w-8 h-8 rounded-full bg-black/10 dark:bg-black/40 object-cover transition-colors duration-200" />
                                <div className={`absolute -bottom-[2px] -right-[2px] w-[14px] h-[14px] border-[2.5px] border-nr-bg group-hover:border-nr-bg rounded-full flex items-center justify-center transition-colors duration-200
                                    ${member.status === 'online' ? 'bg-green-500' : member.status === 'idle' ? 'bg-amber-500' : 'bg-red-500'}`}>
                                </div>
                            </div>
                            <div className="flex flex-col overflow-hidden leading-snug w-full">
                                <span className="text-nr-text truncate group-hover:text-nr-accent transition-colors duration-200">{member.username}</span>
                                {member.game && (
                                    <span className="text-[10px] text-nr-text/60 truncate overflow-hidden block w-full transition-colors duration-200">
                                        Playing <strong className="font-semibold text-nr-text/80 transition-colors duration-200">{member.game.name}</strong>
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* More count */}
                    {moreCount > 0 && (
                        <div className="text-xs text-nr-text/60 py-2 px-1 font-medium italic transition-colors duration-200">
                            {t('discord.more_players', { count: moreCount })}
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Connect Button */}
            <div className="p-3 bg-black/5 dark:bg-black/20 shrink-0 border-t border-nr-border/50 transition-colors duration-200">
                <a
                    href="https://discord.com/invite/uuc"
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
