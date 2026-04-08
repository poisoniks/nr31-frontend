import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Bot, CircleDot, Play, RefreshCw, Square } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { adminApi } from '../../api/adminApi';
import { useUIStore } from '../../store/useUIStore';

type BotStatus =
    | 'INITIALIZING'
    | 'INITIALIZED'
    | 'LOGGING_IN'
    | 'CONNECTING_TO_WEBSOCKET'
    | 'IDENTIFYING_SESSION'
    | 'AWAITING_LOGIN_CONFIRMATION'
    | 'LOADING_SUBSYSTEMS'
    | 'CONNECTED'
    | 'DISCONNECTED'
    | 'RECONNECT_QUEUED'
    | 'WAITING_TO_RECONNECT'
    | 'ATTEMPTING_TO_RECONNECT'
    | 'SHUTTING_DOWN'
    | 'SHUTDOWN'
    | 'FAILED_TO_LOGIN'
    | 'OFFLINE';

const ACTIVE_STATUSES: BotStatus[] = [
    'INITIALIZING',
    'INITIALIZED',
    'LOGGING_IN',
    'CONNECTING_TO_WEBSOCKET',
    'IDENTIFYING_SESSION',
    'AWAITING_LOGIN_CONFIRMATION',
    'LOADING_SUBSYSTEMS',
    'CONNECTED',
];

const TRANSITIONAL_STATUSES: BotStatus[] = [
    'DISCONNECTED',
    'RECONNECT_QUEUED',
    'WAITING_TO_RECONNECT',
    'ATTEMPTING_TO_RECONNECT',
    'SHUTTING_DOWN',
];

const POLL_INTERVAL_MS = 5000;

function getStatusColor(status: BotStatus | null): string {
    if (!status) return 'text-nr-text/40';
    if (status === 'CONNECTED') return 'text-green-500';
    if (status === 'FAILED_TO_LOGIN') return 'text-red-500';
    if (TRANSITIONAL_STATUSES.includes(status)) return 'text-amber-400';
    if (ACTIVE_STATUSES.includes(status)) return 'text-blue-400';
    return 'text-nr-text/40';
}

function getStatusBg(status: BotStatus | null): string {
    if (!status) return 'bg-nr-text/5 border-nr-border/30';
    if (status === 'CONNECTED') return 'bg-green-500/10 border-green-500/30';
    if (status === 'FAILED_TO_LOGIN') return 'bg-red-500/10 border-red-500/30';
    if (TRANSITIONAL_STATUSES.includes(status)) return 'bg-amber-400/10 border-amber-400/30';
    if (ACTIVE_STATUSES.includes(status)) return 'bg-blue-400/10 border-blue-400/30';
    return 'bg-nr-text/5 border-nr-border/30';
}

function isPulsingStatus(status: BotStatus | null): boolean {
    if (!status) return false;
    return ACTIVE_STATUSES.includes(status) || TRANSITIONAL_STATUSES.includes(status);
}

const DiscordPage: React.FC = () => {
    const { t } = useTranslation();
    const { setError } = useUIStore();

    const [status, setStatus] = useState<BotStatus | null>(null);
    const [loadingStatus, setLoadingStatus] = useState(true);
    const [actionLoading, setActionLoading] = useState<'start' | 'stop' | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const fetchStatus = useCallback(async (silent = false) => {
        if (!silent) setLoadingStatus(true);
        try {
            const data = await adminApi.getDiscordBotStatus();
            setStatus((data.status as BotStatus) ?? 'OFFLINE');
            setLastUpdated(new Date());
        } catch {
            setError(t('admin.discord.error_status'));
        } finally {
            if (!silent) setLoadingStatus(false);
        }
    }, [setError, t]);

    useEffect(() => {
        fetchStatus();
        pollRef.current = setInterval(() => fetchStatus(true), POLL_INTERVAL_MS);
        return () => {
            if (pollRef.current) clearInterval(pollRef.current);
        };
    }, [fetchStatus]);

    const handleStart = async () => {
        setActionLoading('start');
        try {
            await adminApi.startDiscordBot();
            await fetchStatus(true);
        } catch {
            setError(t('admin.discord.error_start'));
        } finally {
            setActionLoading(null);
        }
    };

    const handleStop = async () => {
        setActionLoading('stop');
        try {
            await adminApi.stopDiscordBot();
            await fetchStatus(true);
        } catch {
            setError(t('admin.discord.error_stop'));
        } finally {
            setActionLoading(null);
        }
    };

    const isActive = status !== null && ACTIVE_STATUSES.includes(status);
    const isTransitional = status !== null && TRANSITIONAL_STATUSES.includes(status);
    const canStart = !isActive && !isTransitional && status !== null && actionLoading === null;
    const canStop = (isActive || isTransitional) && actionLoading === null;

    const statusColor = getStatusColor(status);
    const statusBg = getStatusBg(status);
    const pulsing = isPulsingStatus(status);

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Page header */}
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-serif font-bold text-nr-text flex items-center gap-3">
                    <Bot className="text-nr-accent" size={24} />
                    {t('admin.discord.title')}
                </h1>
                <p className="text-nr-text/60">{t('admin.discord.subtitle')}</p>
            </div>

            {/* Status card */}
            <div className="glass p-6 rounded-xl border border-nr-border/50 bg-white/5 dark:bg-black/20 backdrop-blur-md shadow-lg max-w-2xl space-y-5 transition-transform md:hover:-translate-y-0.5 duration-300">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-nr-text/50 uppercase tracking-wider">
                        {t('admin.discord.status_label')}
                    </span>
                    <button
                        id="discord-refresh-btn"
                        onClick={() => fetchStatus()}
                        disabled={loadingStatus || actionLoading !== null}
                        title={t('admin.discord.refresh')}
                        className="p-1.5 rounded-lg text-nr-text/40 hover:text-nr-accent hover:bg-nr-accent/10 transition-colors duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <RefreshCw size={15} className={loadingStatus ? 'animate-spin' : ''} />
                    </button>
                </div>

                {/* Status badge */}
                <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${statusBg}`}>
                    <CircleDot
                        size={18}
                        className={`flex-shrink-0 ${statusColor} ${pulsing ? 'animate-pulse' : ''}`}
                    />
                    <div className="flex flex-col">
                        {loadingStatus && !status ? (
                            <div className="h-4 w-32 bg-nr-text/10 rounded animate-pulse" />
                        ) : (
                            <span className={`font-semibold text-sm ${statusColor}`}>
                                {status
                                    ? t(`admin.discord.status.${status}`, { defaultValue: status })
                                    : t('admin.discord.status.UNKNOWN')}
                            </span>
                        )}
                        {lastUpdated && (
                            <span className="text-xs text-nr-text/40 mt-0.5">
                                {t('admin.discord.last_updated', {
                                    time: lastUpdated.toLocaleTimeString(),
                                })}
                            </span>
                        )}
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-3 pt-1">
                    <button
                        id="discord-start-btn"
                        onClick={handleStart}
                        disabled={!canStart}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 cursor-pointer ${
                            canStart
                                ? 'bg-green-600 hover:bg-green-500 text-white shadow-[0_0_14px_rgba(34,197,94,0.25)] hover:shadow-[0_0_20px_rgba(34,197,94,0.4)]'
                                : 'bg-green-600/30 text-green-300/50 cursor-not-allowed'
                        }`}
                    >
                        {actionLoading === 'start' ? (
                            <RefreshCw size={16} className="animate-spin" />
                        ) : (
                            <Play size={16} />
                        )}
                        {actionLoading === 'start'
                            ? t('admin.discord.starting')
                            : t('admin.discord.start_btn')}
                    </button>

                    <button
                        id="discord-stop-btn"
                        onClick={handleStop}
                        disabled={!canStop}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 cursor-pointer ${
                            canStop
                                ? 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_14px_rgba(239,68,68,0.25)] hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]'
                                : 'bg-red-600/30 text-red-300/50 cursor-not-allowed'
                        }`}
                    >
                        {actionLoading === 'stop' ? (
                            <RefreshCw size={16} className="animate-spin" />
                        ) : (
                            <Square size={16} />
                        )}
                        {actionLoading === 'stop'
                            ? t('admin.discord.stopping')
                            : t('admin.discord.stop_btn')}
                    </button>
                </div>
            </div>

            {/* Status legend */}
            <div className="glass p-5 rounded-xl border border-nr-border/50 bg-white/5 dark:bg-black/20 backdrop-blur-md shadow-lg max-w-2xl">
                <h2 className="text-sm font-semibold text-nr-text/60 uppercase tracking-wider mb-3">
                    {t('admin.discord.legend_title')}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-sm">
                    <div className="flex items-center gap-2">
                        <CircleDot size={13} className="text-green-500 flex-shrink-0" />
                        <span className="text-nr-text/70">{t('admin.discord.legend.connected')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CircleDot size={13} className="text-blue-400 flex-shrink-0" />
                        <span className="text-nr-text/70">{t('admin.discord.legend.starting')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CircleDot size={13} className="text-amber-400 flex-shrink-0" />
                        <span className="text-nr-text/70">{t('admin.discord.legend.transitional')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CircleDot size={13} className="text-red-500 flex-shrink-0" />
                        <span className="text-nr-text/70">{t('admin.discord.legend.failed')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CircleDot size={13} className="text-nr-text/30 flex-shrink-0" />
                        <span className="text-nr-text/70">{t('admin.discord.legend.offline')}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DiscordPage;
