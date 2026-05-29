import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    Cpu,
    MemoryStick,
    HardDrive,
    RefreshCw,
    ChevronDown,
    Database,
    Layers,
    Server,
} from 'lucide-react';
import { useMetrics } from '../../hooks/useMetrics';
import type { SectionKey } from '../../hooks/useMetrics';
import type { CacheMetrics, HibernateCacheCategory } from '../../api/metricsApi';
import type { ContainerInfo } from '../../api/hostMetricsApi';

function formatBytes(bytes: number): string {
    if (bytes <= 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}


function formatUptime(seconds: number, t: (key: string) => string): string {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const parts: string[] = [];
    if (d > 0) parts.push(`${d}${t('admin.overview.uptime.days')}`);
    if (h > 0) parts.push(`${h}${t('admin.overview.uptime.hours')}`);
    if (m > 0) parts.push(`${m}${t('admin.overview.uptime.minutes')}`);
    if (parts.length === 0) parts.push(`${s}${t('admin.overview.uptime.seconds')}`);
    return parts.join(' ');
}

function formatContainerUptime(startedAt: string, t: (key: string) => string): string {
    if (!startedAt) return '—';
    const start = new Date(startedAt).getTime();
    const now = Date.now();
    const diffSeconds = Math.max(0, Math.floor((now - start) / 1000));
    return formatUptime(diffSeconds, t);
}

function hitRatio(hits: number, misses: number): number {
    const total = hits + misses;
    return total === 0 ? 0 : (hits / total) * 100;
}

type ThresholdColor = 'green' | 'amber' | 'red';

function thresholdColor(pct: number, invert = false): ThresholdColor {
    if (invert) {
        if (pct >= 80) return 'green';
        if (pct >= 50) return 'amber';
        return 'red';
    }
    if (pct < 60) return 'green';
    if (pct < 80) return 'amber';
    return 'red';
}

const barColorMap: Record<ThresholdColor, string> = {
    green: 'bg-emerald-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
};

const textColorMap: Record<ThresholdColor, string> = {
    green: 'text-emerald-400',
    amber: 'text-amber-400',
    red: 'text-red-400',
};

const CONTAINER_COLORS = [
    '#3B82F6', // Blue
    '#10B981', // Emerald
    '#8B5CF6', // Violet
    '#F59E0B', // Amber
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#F97316', // Orange
    '#6366F1', // Indigo
];
const OTHER_COLOR = '#6B7280'; // Gray
const FREE_COLOR = 'rgba(255, 255, 255, 0.05)';
const VOLUME_OTHER_COLOR = '#94A3B8'; // Slate for other volumes

const getContainerColorMap = (containers: ContainerInfo[]): Record<string, string> => {
    const map: Record<string, string> = {};
    containers.forEach((c, idx) => {
        map[c.id] = CONTAINER_COLORS[idx % CONTAINER_COLORS.length];
    });
    return map;
};

interface MetricBarProps {
    label: string;
    pct: number;
    color: ThresholdColor;
    display: string;
}

const MetricBar: React.FC<MetricBarProps> = ({ label, pct, color, display }) => (
    <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
            <span className="text-nr-text/60 font-medium">{label}</span>
            <span className={`font-bold font-mono ${textColorMap[color]}`}>{display}</span>
        </div>
        <div className="h-2 rounded-full bg-nr-text/10 overflow-hidden">
            <div
                className={`h-full rounded-full transition-all duration-700 ${barColorMap[color]}`}
                style={{ width: `${pct}%` }}
            />
        </div>
    </div>
);

interface StatCardProps {
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, children }) => (
    <div className="glass-card rounded-xl p-5 border border-nr-border flex flex-col gap-4">
        <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-nr-accent/10 flex items-center justify-center text-nr-accent">
                {icon}
            </div>
            <h3 className="font-semibold text-nr-text text-sm uppercase tracking-wide">{title}</h3>
        </div>
        <div className="space-y-3 flex-1 flex flex-col justify-between">{children}</div>
    </div>
);

interface StackedBarSegment {
    label: string;
    value: number;
    color: string;
    displayValue: string;
}

interface StackedBarProps {
    segments: StackedBarSegment[];
    total: number;
}

const StackedBar: React.FC<StackedBarProps> = ({ segments, total }) => {
    const activeSegments = segments.filter((s) => s.value > 0);
    return (
        <div className="h-3 w-full rounded-full bg-nr-text/10 overflow-hidden flex transition-all duration-300">
            {activeSegments.map((segment, idx) => {
                const pct = total > 0 ? (segment.value / total) * 100 : 0;
                return (
                    <div
                        key={idx}
                        className="h-full relative group transition-all duration-500 ease-out"
                        style={{
                            width: `${pct}%`,
                            backgroundColor: segment.color,
                        }}
                        title={`${segment.label}: ${segment.displayValue} (${pct.toFixed(1)}%)`}
                    />
                );
            })}
        </div>
    );
};

interface CollapsibleSectionProps {
    title: string;
    icon: React.ReactNode;
    open: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
    title,
    icon,
    open,
    onToggle,
    children,
}) => (
    <div className="glass-card rounded-xl border border-nr-border overflow-hidden">
        <button
            onClick={onToggle}
            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-nr-accent/5 transition-colors duration-200 cursor-pointer"
        >
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-nr-accent/10 flex items-center justify-center text-nr-accent">
                    {icon}
                </div>
                <span className="font-semibold text-nr-text text-sm uppercase tracking-wide">
                    {title}
                </span>
            </div>
            <ChevronDown
                size={18}
                className={`text-nr-text/40 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
            />
        </button>
        {open && <div className="px-5 pb-5 pt-1">{children}</div>}
    </div>
);

const SkeletonCard: React.FC = () => (
    <div className="glass-card rounded-xl p-5 border border-nr-border space-y-4 animate-pulse">
        <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-nr-text/10" />
            <div className="h-4 w-28 rounded bg-nr-text/10" />
        </div>
        <div className="space-y-3">
            <div className="h-3 w-full rounded bg-nr-text/10" />
            <div className="h-2 w-full rounded-full bg-nr-text/10" />
            <div className="h-3 w-full rounded bg-nr-text/10" />
            <div className="h-2 w-full rounded-full bg-nr-text/10" />
        </div>
    </div>
);

const InfrastructureSkeleton: React.FC = () => (
    <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
        </div>
        <div className="glass-card rounded-xl p-5 border border-nr-border space-y-3">
            <div className="h-4 w-40 bg-nr-text/10 rounded" />
            <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-6 w-full bg-nr-text/5 rounded" />
                ))}
            </div>
        </div>
    </div>
);



const TableSectionSkeleton: React.FC = () => (
    <div className="pt-2 space-y-2 animate-pulse">
        {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 rounded bg-nr-text/10" />
        ))}
    </div>
);

const HibernateSectionSkeleton: React.FC = () => (
    <div className="pt-2 space-y-3 animate-pulse">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 rounded-lg border border-nr-border/60 bg-nr-text/[0.03]" />
        ))}
    </div>
);

interface HibernateCacheCardProps {
    label: string;
    data: HibernateCacheCategory;
    t: (key: string) => string;
}

const HibernateCacheCard: React.FC<HibernateCacheCardProps> = ({ label, data, t }) => {
    const ratio = hitRatio(data.hits, data.misses);
    const color = thresholdColor(ratio, true);
    return (
        <div className="rounded-lg border border-nr-border/60 bg-nr-text/[0.03] p-4 space-y-3">
            <p className="text-xs font-semibold text-nr-text/70 uppercase tracking-wide">{label}</p>
            <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                    <p className="text-lg font-bold text-nr-text font-mono">
                        {data.puts.toLocaleString()}
                    </p>
                    <p className="text-xs text-nr-text/50">{t('admin.overview.hibernate.puts')}</p>
                </div>
                <div>
                    <p className={`text-lg font-bold font-mono ${textColorMap[color]}`}>
                        {data.hits.toLocaleString()}
                    </p>
                    <p className="text-xs text-nr-text/50">{t('admin.overview.hibernate.hits')}</p>
                </div>
                <div>
                    <p className="text-lg font-bold text-red-400 font-mono">
                        {data.misses.toLocaleString()}
                    </p>
                    <p className="text-xs text-nr-text/50">
                        {t('admin.overview.hibernate.misses')}
                    </p>
                </div>
            </div>
            <MetricBar
                label={t('admin.overview.cache.hit_ratio')}
                pct={ratio}
                color={color}
                display={`${ratio.toFixed(1)}%`}
            />
        </div>
    );
};

interface CacheRowProps {
    cache: CacheMetrics;
}

const CacheRow: React.FC<CacheRowProps> = ({ cache }) => {
    const ratio = hitRatio(cache.hits, cache.misses);
    const color = thresholdColor(ratio, true);
    return (
        <tr className="border-b border-nr-border/40 last:border-0 hover:bg-nr-accent/5 transition-colors">
            <td className="py-3 px-3 text-sm font-medium text-nr-text font-mono">{cache.name}</td>
            <td className="py-3 px-3 text-sm text-center text-nr-text/80 font-mono">
                {cache.size.toLocaleString()}
            </td>
            <td className="py-3 px-3 text-sm text-center text-emerald-400 font-mono font-medium">
                {cache.hits.toLocaleString()}
            </td>
            <td className="py-3 px-3 text-sm text-center text-red-400 font-mono font-medium">
                {cache.misses.toLocaleString()}
            </td>
            <td className="py-3 px-3 min-w-[120px]">
                <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-nr-text/10 overflow-hidden">
                        <div
                            className={`h-full rounded-full ${barColorMap[color]}`}
                            style={{ width: `${ratio}%` }}
                        />
                    </div>
                    <span
                        className={`text-xs font-mono font-bold min-w-[38px] text-right ${textColorMap[color]}`}
                    >
                        {ratio.toFixed(0)}%
                    </span>
                </div>
            </td>
            <td className="py-3 px-3 text-sm text-center text-nr-text/60 font-mono">
                {cache.evictions.toLocaleString()}
            </td>
        </tr>
    );
};

const OverviewPage: React.FC = () => {
    const { t } = useTranslation();
    const { hostMetrics, spring, hibernate, openSections, refreshing, fetchedAt, isLive, setIsLive, toggleSection, refresh } =
        useMetrics();

    const toggle = (key: SectionKey) => toggleSection(key, !openSections.has(key));

    const isNamedVolume = (name: string) => !/^[a-f0-9]{64}$/.test(name);

    const renderInfraCards = () => {
        if (!hostMetrics.data) return null;
        const { host, containers, volumes } = hostMetrics.data;

        const containerColorMap = getContainerColorMap(containers);

        const cpuSegments: StackedBarSegment[] = [];
        let totalContainerCpuUsedRel = 0;
        containers.forEach((c) => {
            const relCpu = c.cpuPercent / host.cpuCores;
            totalContainerCpuUsedRel += relCpu;
            if (relCpu > 0) {
                cpuSegments.push({
                    label: c.name,
                    value: relCpu,
                    color: containerColorMap[c.id],
                    displayValue: `${c.cpuPercent.toFixed(1)}%`,
                });
            }
        });
        const otherCpu = Math.max(0, host.cpuUsagePercent - totalContainerCpuUsedRel);
        if (otherCpu > 0) {
            cpuSegments.push({
                label: t('admin.overview.infra.other'),
                value: otherCpu,
                color: OTHER_COLOR,
                displayValue: `${otherCpu.toFixed(1)}%`,
            });
        }
        const freeCpu = Math.max(0, 100 - host.cpuUsagePercent);
        cpuSegments.push({
            label: t('admin.overview.disk.free'),
            value: freeCpu,
            color: FREE_COLOR,
            displayValue: `${freeCpu.toFixed(1)}%`,
        });

        const memSegments: StackedBarSegment[] = [];
        let totalContainerMem = 0;
        containers.forEach((c) => {
            totalContainerMem += c.memoryUsedBytes;
            if (c.memoryUsedBytes > 0) {
                memSegments.push({
                    label: c.name,
                    value: c.memoryUsedBytes,
                    color: containerColorMap[c.id],
                    displayValue: formatBytes(c.memoryUsedBytes),
                });
            }
        });
        const otherMem = Math.max(0, host.memoryUsedBytes - totalContainerMem);
        if (otherMem > 0) {
            memSegments.push({
                label: t('admin.overview.infra.other'),
                value: otherMem,
                color: OTHER_COLOR,
                displayValue: formatBytes(otherMem),
            });
        }
        const freeMem = Math.max(0, host.memoryTotalBytes - host.memoryUsedBytes);
        memSegments.push({
            label: t('admin.overview.disk.free'),
            value: freeMem,
            color: FREE_COLOR,
            displayValue: formatBytes(freeMem),
        });

        const diskSegments: StackedBarSegment[] = [];
        let totalVolumeBytes = 0;
        let otherVolumeBytes = 0;

        volumes.forEach((v) => {
            totalVolumeBytes += v.sizeBytes;
            if (isNamedVolume(v.name)) {
                if (v.sizeBytes > 0) {
                    diskSegments.push({
                        label: v.name,
                        value: v.sizeBytes,
                        color: CONTAINER_COLORS[diskSegments.length % CONTAINER_COLORS.length],
                        displayValue: formatBytes(v.sizeBytes),
                    });
                }
            } else {
                otherVolumeBytes += v.sizeBytes;
            }
        });

        if (otherVolumeBytes > 0) {
            diskSegments.push({
                label: t('admin.overview.infra.volume_other'),
                value: otherVolumeBytes,
                color: VOLUME_OTHER_COLOR,
                displayValue: formatBytes(otherVolumeBytes),
            });
        }

        const otherDiskUsed = Math.max(0, host.diskUsedBytes - totalVolumeBytes);
        if (otherDiskUsed > 0) {
            diskSegments.push({
                label: t('admin.overview.infra.disk_other'),
                value: otherDiskUsed,
                color: OTHER_COLOR,
                displayValue: formatBytes(otherDiskUsed),
            });
        }

        const freeDisk = Math.max(0, host.diskTotalBytes - host.diskUsedBytes);
        diskSegments.push({
            label: t('admin.overview.disk.free'),
            value: freeDisk,
            color: FREE_COLOR,
            displayValue: formatBytes(freeDisk),
        });

        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatCard icon={<Cpu size={18} />} title={t('admin.overview.infra.cpu_title')}>
                        <div className="space-y-2">
                            <StackedBar segments={cpuSegments} total={100} />
                            <div className="flex justify-between items-baseline text-xs">
                                <span className="font-mono font-bold text-nr-text">
                                    {host.cpuUsagePercent.toFixed(1)}% {t('admin.overview.infra.of')} {host.cpuCores} {t('admin.overview.infra.cores')}
                                </span>
                            </div>
                        </div>
                    </StatCard>

                    <StatCard icon={<MemoryStick size={18} />} title={t('admin.overview.infra.memory_title')}>
                        <div className="space-y-2">
                            <StackedBar segments={memSegments} total={host.memoryTotalBytes} />
                            <div className="flex justify-between items-baseline text-xs">
                                <span className="font-mono font-bold text-nr-text">
                                    {formatBytes(host.memoryUsedBytes)} / {formatBytes(host.memoryTotalBytes)}
                                </span>
                                <span className="text-nr-text/40 font-mono">
                                    {((host.memoryUsedBytes / host.memoryTotalBytes) * 100).toFixed(0)}%
                                </span>
                            </div>
                        </div>
                    </StatCard>

                    <StatCard icon={<HardDrive size={18} />} title={t('admin.overview.infra.disk_title')}>
                        <div className="space-y-2">
                            <StackedBar segments={diskSegments} total={host.diskTotalBytes} />
                            <div className="flex justify-between items-baseline text-xs">
                                <span className="font-mono font-bold text-nr-text">
                                    {formatBytes(host.diskUsedBytes)} / {formatBytes(host.diskTotalBytes)}
                                </span>
                                <span className="text-nr-text/40 font-mono">
                                    {((host.diskUsedBytes / host.diskTotalBytes) * 100).toFixed(0)}%
                                </span>
                            </div>
                        </div>
                    </StatCard>
                </div>

                <div className="glass-card rounded-xl p-5 border border-nr-border space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-nr-accent/10 flex items-center justify-center text-nr-accent">
                            <Server size={16} />
                        </div>
                        <h3 className="font-semibold text-nr-text text-sm uppercase tracking-wide">
                            {t('admin.overview.infra.containers')}
                        </h3>
                    </div>

                    <div className="overflow-x-auto">
                        <div className="min-w-[700px] divide-y divide-nr-border/20">
                            <div className="grid grid-cols-12 gap-4 py-2.5 text-xs font-semibold text-nr-text/50 uppercase tracking-wide font-sans">
                                <div className="col-span-4">{t('admin.overview.infra.containers')}</div>
                                <div className="col-span-2 text-center">CPU</div>
                                <div className="col-span-2 text-center">{t('admin.overview.infra.memory_title')}</div>
                                <div className="col-span-2 text-center">{t('admin.users.table.status')}</div>
                                <div className="col-span-2 text-right">{t('admin.overview.infra.uptime_header')}</div>
                            </div>

                            {containers.map((c) => {
                                const statusColor =
                                    c.status === 'running' ? 'bg-emerald-500' :
                                        c.status === 'restarting' ? 'bg-amber-500' : 'bg-red-500';

                                return (
                                    <div key={c.id} className="grid grid-cols-12 gap-4 py-3 items-center hover:bg-nr-accent/5 transition-colors duration-150">
                                        <div className="col-span-4 flex items-center gap-2.5">
                                            <span
                                                className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                                                style={{ backgroundColor: containerColorMap[c.id] }}
                                            />
                                            <div className="flex flex-col">
                                                <span className="font-mono text-sm font-semibold text-nr-text">{c.name}</span>
                                                <span className="text-[10px] text-nr-text/40 font-mono tracking-wider uppercase">{c.service}</span>
                                            </div>
                                        </div>
                                        <div className="col-span-2 text-center">
                                            <span className="font-mono text-sm text-nr-text font-semibold">{c.cpuPercent.toFixed(1)}%</span>
                                            <span className="block text-[10px] text-nr-text/40 font-mono">
                                                {((c.cpuPercent / host.cpuCores)).toFixed(1)}% {t('admin.overview.infra.of').toLowerCase()} host
                                            </span>
                                        </div>
                                        <div className="col-span-2 text-center">
                                            <span className="font-mono text-sm text-nr-text font-semibold">{formatBytes(c.memoryUsedBytes)}</span>
                                            <span className="block text-[10px] text-nr-text/40 font-mono">
                                                {c.memoryLimitBytes > 0 && c.memoryLimitBytes < 9223372036854775000
                                                    ? `${t('admin.overview.infra.of').toLowerCase()} ${formatBytes(c.memoryLimitBytes)}`
                                                    : t('admin.overview.infra.no_limit')
                                                }
                                            </span>
                                        </div>
                                        <div className="col-span-2 text-center flex items-center justify-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${statusColor}`} />
                                            <span className="text-xs font-semibold text-nr-text/80">
                                                {t(`admin.overview.infra.status.${c.status}`, { defaultValue: c.status })}
                                            </span>
                                            {c.restartCount > 0 && (
                                                <span
                                                    className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-400 flex items-center gap-0.5"
                                                    title={`${c.restartCount} ${t('admin.overview.infra.restarts')}`}
                                                >
                                                    ↻ {c.restartCount}
                                                </span>
                                            )}
                                        </div>
                                        <div className="col-span-2 text-right font-mono text-xs text-nr-text/70">
                                            {formatContainerUptime(c.startedAt, t)}
                                        </div>
                                    </div>
                                );
                            })}

                            {volumes.length > 0 && (
                                <div className="pt-4 border-t border-nr-border/20 space-y-2">
                                    <h4 className="text-xs font-semibold text-nr-text/60 uppercase tracking-wider">
                                        {t('admin.overview.infra.volumes')}
                                    </h4>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-nr-text/70 font-mono">
                                        {volumes.filter(v => isNamedVolume(v.name) && v.sizeBytes > 0).map((v) => (
                                            <div key={v.name} className="flex items-center gap-1.5">
                                                <Database size={12} className="text-nr-accent/70" />
                                                <span>{v.name.split('_').pop()}:</span>
                                                <span className="font-semibold text-nr-text">{formatBytes(v.sizeBytes)}</span>
                                            </div>
                                        ))}
                                        {otherVolumeBytes > 0 && (
                                            <div className="flex items-center gap-1.5">
                                                <Database size={12} className="text-nr-text/40" />
                                                <span>{t('admin.overview.infra.volume_other')}:</span>
                                                <span className="font-semibold text-nr-text">{formatBytes(otherVolumeBytes)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="font-serif text-3xl font-bold text-nr-text">
                        {t('admin.overview.title')}
                    </h1>
                    <p className="text-nr-text/60 mt-1">{t('admin.overview.subtitle')}</p>
                </div>
                <div className="flex items-center gap-4">
                    {fetchedAt && (
                        <p className="text-xs text-nr-text/40">
                            {t('admin.overview.last_updated', {
                                time: fetchedAt.toLocaleTimeString(),
                            })}
                        </p>
                    )}

                    <label className="flex items-center gap-2 cursor-pointer">
                        <div className="relative flex items-center">
                            <input
                                type="checkbox"
                                className="sr-only"
                                checked={isLive}
                                onChange={(e) => setIsLive(e.target.checked)}
                            />
                            <div className={`block w-10 h-6 rounded-full transition-colors duration-300 ${isLive ? 'bg-nr-accent' : 'bg-nr-border'}`} />
                            <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 shadow-sm ${isLive ? 'translate-x-4' : ''}`} />
                        </div>
                        <span className="text-sm font-medium text-nr-text/80 select-none">
                            {t('admin.overview.live_update')}
                        </span>
                    </label>

                    <button
                        onClick={refresh}
                        disabled={refreshing || hostMetrics.loading || isLive}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-nr-accent/10 hover:bg-nr-accent/20 border border-nr-accent/30 text-nr-accent text-sm font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <RefreshCw size={15} className={refreshing && !isLive ? 'animate-spin' : ''} />
                        {refreshing && !isLive
                            ? t('admin.overview.refreshing')
                            : t('admin.overview.refresh')}
                    </button>
                </div>
            </div>

            {hostMetrics.loading ? (
                <InfrastructureSkeleton />
            ) : hostMetrics.data ? (
                renderInfraCards()
            ) : (
                <p className="text-sm text-red-400 py-6 text-center border border-dashed border-red-400/30 rounded-xl bg-red-400/5">
                    {t('admin.overview.infra.error')}
                </p>
            )}




            <CollapsibleSection
                title={t('admin.overview.section.spring_cache')}
                icon={<Layers size={16} />}
                open={openSections.has('spring')}
                onToggle={() => toggle('spring')}
            >
                {spring.loading ? (
                    <TableSectionSkeleton />
                ) : spring.data && spring.data.length > 0 ? (
                    <div className="pt-2 overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-nr-border/60">
                                    <th className="pb-2 px-3 text-xs font-semibold text-nr-text/50 uppercase tracking-wide">
                                        {t('admin.overview.cache.name')}
                                    </th>
                                    <th className="pb-2 px-3 text-xs font-semibold text-nr-text/50 uppercase tracking-wide text-center">
                                        {t('admin.overview.cache.size')}
                                    </th>
                                    <th className="pb-2 px-3 text-xs font-semibold text-nr-text/50 uppercase tracking-wide text-center">
                                        {t('admin.overview.cache.hits')}
                                    </th>
                                    <th className="pb-2 px-3 text-xs font-semibold text-nr-text/50 uppercase tracking-wide text-center">
                                        {t('admin.overview.cache.misses')}
                                    </th>
                                    <th className="pb-2 px-3 text-xs font-semibold text-nr-text/50 uppercase tracking-wide">
                                        {t('admin.overview.cache.hit_ratio')}
                                    </th>
                                    <th className="pb-2 px-3 text-xs font-semibold text-nr-text/50 uppercase tracking-wide text-center">
                                        {t('admin.overview.cache.evictions')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {spring.data.map((cache) => (
                                    <CacheRow key={cache.name} cache={cache} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-sm text-nr-text/50 py-4 text-center">
                        {t('admin.overview.cache.no_data')}
                    </p>
                )}
            </CollapsibleSection>

            <CollapsibleSection
                title={t('admin.overview.section.hibernate_cache')}
                icon={<Database size={16} />}
                open={openSections.has('hibernate')}
                onToggle={() => toggle('hibernate')}
            >
                {hibernate.loading ? (
                    <HibernateSectionSkeleton />
                ) : hibernate.data ? (
                    <div className="pt-2 space-y-3">
                        <HibernateCacheCard
                            label={t('admin.overview.hibernate.entity_cache')}
                            data={hibernate.data.entityCache}
                            t={t}
                        />
                        <HibernateCacheCard
                            label={t('admin.overview.hibernate.query_cache')}
                            data={hibernate.data.queryCache}
                            t={t}
                        />
                        <div className="rounded-lg border border-nr-border/60 bg-nr-text/[0.03] p-4 space-y-1">
                            <p className="text-xs font-semibold text-nr-text/70 uppercase tracking-wide">
                                {t('admin.overview.hibernate.query_plan')}
                            </p>
                            <p className="text-2xl font-bold font-mono text-nr-accent">
                                {hibernate.data.queryPlanHits.toLocaleString()}
                            </p>
                            <p className="text-xs text-nr-text/40">
                                {t('admin.overview.hibernate.hits')}
                            </p>
                        </div>
                    </div>
                ) : null}
            </CollapsibleSection>
        </div>
    );
};

export default OverviewPage;
