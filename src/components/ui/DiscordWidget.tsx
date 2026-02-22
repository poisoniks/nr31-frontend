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
            <div className="flex items-center justify-center bg-[#f2f3f5] dark:bg-[#2f3136] text-[#313338] dark:text-[#dcddde] w-full h-full font-sans text-sm">
                <div className="w-8 h-8 border-4 border-[#5865F2] border-t-transparent rounded-full animate-spin"></div>
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
        <div className="flex flex-col bg-[#f2f3f5] dark:bg-[#2f3136] text-[#313338] dark:text-[#dcddde] w-full h-full font-sans text-sm transition-colors duration-200">
            {/* Header */}
            <div className="flex flex-col border-b border-[#e3e5e8] dark:border-[#202225] p-4 bg-[#f2f3f5] dark:bg-[#2f3136] shrink-0 transition-colors duration-200">
                <div className="flex items-center gap-3">
                    {logoUrl ? (
                        <img src={logoUrl} alt="Server Logo" className="w-12 h-12 rounded-2xl object-cover shadow-sm bg-[#e3e5e8] dark:bg-[#36393f] border border-[#c4c9ce]/50 dark:border-[#202225]/50 transition-colors duration-200" />
                    ) : (
                        <div className="w-12 h-12 rounded-2xl bg-[#e3e5e8] dark:bg-[#36393f] flex items-center justify-center text-xs font-bold shrink-0 border border-[#c4c9ce]/50 dark:border-[#202225]/50 text-[#313338] dark:text-white transition-colors duration-200">
                            NR31
                        </div>
                    )}
                    <div className="flex flex-col min-w-0">
                        <span className="font-bold text-[#060607] dark:text-white truncate text-base drop-shadow-sm transition-colors duration-200">{discordData.name}</span>
                        <span className="text-xs text-[#4e5058] dark:text-[#b9bbbe] flex items-center gap-1.5 mt-0.5 transition-colors duration-200">
                            <span className="w-2 h-2 rounded-full bg-[#3ba55c] shadow-[0_0_4px_#3ba55c]"></span>
                            <span className="font-medium text-[#313338] dark:text-[#dcddde] transition-colors duration-200">{discordData.presence_count}</span> {t('discord.members_online')}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {/* Top Games Section */}
                {topGames.length > 0 && (
                    <div className="mb-4">
                        <span className="text-xs font-bold uppercase text-[#5c5e66] dark:text-[#8e9297] mb-2 block transition-colors duration-200">{t('discord.currently_playing')}</span>
                        <div className="flex flex-wrap gap-2 text-xs">
                            {topGames.map(game => (
                                <div key={game} className="bg-[#e3e5e8] dark:bg-[#202225] border border-[#c4c9ce] dark:border-[#202225] shadow-sm px-2.5 py-1.5 rounded-md text-[#4e5058] dark:text-[#b9bbbe] max-w-full truncate font-medium transition-colors duration-200" title={game}>
                                    {game}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Members List */}
                <div className="space-y-0.5">
                    {displayMembers.map(member => (
                        <div key={member.id} className="flex items-center gap-3 py-1.5 px-2 -mx-2 hover:bg-[#e3e5e8]/80 dark:hover:bg-[#36393f]/80 rounded cursor-pointer transition-colors duration-200 group">
                            <div className="relative shrink-0">
                                <img src={member.avatar_url} alt={member.username} className="w-8 h-8 rounded-full bg-[#e3e5e8] dark:bg-[#202225] object-cover transition-colors duration-200" />
                                <div className={`absolute -bottom-[2px] -right-[2px] w-[14px] h-[14px] border-[2.5px] border-[#f2f3f5] dark:border-[#2f3136] group-hover:border-[#e3e5e8] dark:group-hover:border-[#35383d] rounded-full flex items-center justify-center transition-colors duration-200
                                    ${member.status === 'online' ? 'bg-[#3ba55c]' : member.status === 'idle' ? 'bg-[#faa61a]' : 'bg-[#ed4245]'}`}>
                                </div>
                            </div>
                            <div className="flex flex-col overflow-hidden leading-snug w-full">
                                <span className="text-[#313338] dark:text-[#dcddde] truncate group-hover:text-[#060607] dark:group-hover:text-white transition-colors duration-200">{member.username}</span>
                                {member.game && (
                                    <span className="text-[10px] text-[#4e5058] dark:text-[#b9bbbe] truncate overflow-hidden block w-full transition-colors duration-200">
                                        Playing <strong className="font-semibold text-[#313338] dark:text-[#dcddde] transition-colors duration-200">{member.game.name}</strong>
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* More count */}
                    {moreCount > 0 && (
                        <div className="text-xs text-[#5c5e66] dark:text-[#8e9297] py-2 px-1 font-medium italic transition-colors duration-200">
                            {t('discord.more_players', { count: moreCount })}
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Connect Button */}
            <div className="p-3 bg-[#e3e5e8] dark:bg-[#202225] shrink-0 border-t border-[#c4c9ce]/50 dark:border-[#202225]/50 transition-colors duration-200">
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
