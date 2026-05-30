import api from './axiosConfig';
import { env } from '../config/environment';

// Actuator endpoints live at the server root, not under /api.
const ACTUATOR_BASE = env.API_BASE_URL.replace(/\/api\/?$/, '');

// ── Actuator raw response types ───────────────────────────────────────────────

export interface ActuatorMeasurement {
    statistic: string;
    value: number;
}

export interface ActuatorTag {
    tag: string;
    values: string[];
}

export interface ActuatorMetricResponse {
    name: string;
    description: string | null;
    baseUnit: string | null;
    measurements: ActuatorMeasurement[];
    availableTags: ActuatorTag[];
}

export interface ActuatorCacheEntry {
    target: string;
}

export interface ActuatorCacheManager {
    caches: Record<string, ActuatorCacheEntry>;
}

export interface ActuatorCachesResponse {
    cacheManagers: Record<string, ActuatorCacheManager>;
}

// ── Per-section result types ──────────────────────────────────────────────────

export interface SystemSectionMetrics {
    processCpuUsage: number;
    systemCpuUsage: number;
    jvmMemoryUsedBytes: number;
    jvmMemoryMaxBytes: number;
    diskFreeBytes: number;
    diskTotalBytes: number;
    uptimeSeconds: number;
    startTimeEpochSeconds: number;
}

export interface HttpSectionMetrics {
    totalRequests: number;
    activeRequests: number;
}

export interface CacheMetrics {
    name: string;
    size: number;
    hits: number;
    misses: number;
    evictions: number;
}

export interface HibernateCacheCategory {
    puts: number;
    hits: number;
    misses: number;
}

export interface HibernateMetrics {
    entityCache: HibernateCacheCategory;
    queryCache: HibernateCacheCategory;
    queryPlanHits: number;
}

// ── Helper ────────────────────────────────────────────────────────────────────

function getValue(metric: ActuatorMetricResponse, statistic = 'VALUE'): number {
    return metric.measurements.find((m) => m.statistic === statistic)?.value ?? 0;
}

// ── API functions ─────────────────────────────────────────────────────────────

export const metricsApi = {
    getMetric: async (name: string, tags?: string): Promise<ActuatorMetricResponse> => {
        const params = tags ? { tag: tags } : undefined;
        const response = await api.get<ActuatorMetricResponse>(`/actuator/metrics/${name}`, {
            baseURL: ACTUATOR_BASE,
            params,
        });
        return response.data;
    },

    getCaches: async (): Promise<ActuatorCachesResponse> => {
        const response = await api.get<ActuatorCachesResponse>('/actuator/caches', {
            baseURL: ACTUATOR_BASE,
        });
        return response.data;
    },

    fetchSystemMetrics: async (): Promise<SystemSectionMetrics> => {
        const [cpu, sysCpu, memUsed, memMax, diskFree, diskTotal, uptime, startTime] =
            await Promise.all([
                metricsApi.getMetric('process.cpu.usage'),
                metricsApi.getMetric('system.cpu.usage'),
                metricsApi.getMetric('jvm.memory.used'),
                metricsApi.getMetric('jvm.memory.max'),
                metricsApi.getMetric('disk.free'),
                metricsApi.getMetric('disk.total'),
                metricsApi.getMetric('process.uptime'),
                metricsApi.getMetric('process.start.time'),
            ]);
        return {
            processCpuUsage: getValue(cpu),
            systemCpuUsage: getValue(sysCpu),
            jvmMemoryUsedBytes: getValue(memUsed),
            jvmMemoryMaxBytes: getValue(memMax),
            diskFreeBytes: getValue(diskFree),
            diskTotalBytes: getValue(diskTotal),
            uptimeSeconds: getValue(uptime),
            startTimeEpochSeconds: getValue(startTime),
        };
    },

    fetchHttpMetrics: async (): Promise<HttpSectionMetrics> => {
        const [total, active] = await Promise.all([
            metricsApi.getMetric('http.server.requests'),
            metricsApi.getMetric('http.server.requests.active'),
        ]);
        return {
            totalRequests: getValue(total, 'COUNT'),
            activeRequests: getValue(active, 'VALUE'),
        };
    },

    fetchSpringCacheMetrics: async (): Promise<CacheMetrics[]> => {
        const cachesResponse = await metricsApi.getCaches();
        const cacheNames = Object.keys(
            Object.values(cachesResponse.cacheManagers)[0]?.caches ?? {},
        );
        return Promise.all(
            cacheNames.map(async (name): Promise<CacheMetrics> => {
                const tag = `cache:${name}`;
                const [sizeRes, hitsRes, missesRes, evictionsRes] = await Promise.allSettled([
                    metricsApi.getMetric('cache.size', tag),
                    metricsApi.getMetric('cache.gets', `${tag},result:hit`),
                    metricsApi.getMetric('cache.gets', `${tag},result:miss`),
                    metricsApi.getMetric('cache.evictions', tag),
                ]);
                return {
                    name,
                    size: sizeRes.status === 'fulfilled' ? getValue(sizeRes.value) : 0,
                    hits: hitsRes.status === 'fulfilled' ? getValue(hitsRes.value, 'COUNT') : 0,
                    misses: missesRes.status === 'fulfilled' ? getValue(missesRes.value, 'COUNT') : 0,
                    evictions:
                        evictionsRes.status === 'fulfilled'
                            ? getValue(evictionsRes.value, 'COUNT')
                            : 0,
                };
            }),
        );
    },

    fetchHibernateMetrics: async (): Promise<HibernateMetrics> => {
        const [l2Puts, l2Reqs, queryPuts, queryReqs, queryPlan] = await Promise.all([
            metricsApi.getMetric('hibernate.second.level.cache.puts'),
            metricsApi.getMetric('hibernate.second.level.cache.requests'),
            metricsApi.getMetric('hibernate.cache.query.puts'),
            metricsApi.getMetric('hibernate.cache.query.requests'),
            metricsApi.getMetric('hibernate.cache.query.plan'),
        ]);
        const l2PutsVal = getValue(l2Puts, 'COUNT');
        const l2ReqsVal = getValue(l2Reqs, 'COUNT');
        const queryPutsVal = getValue(queryPuts, 'COUNT');
        const queryReqsVal = getValue(queryReqs, 'COUNT');
        return {
            entityCache: {
                puts: l2PutsVal,
                hits: l2ReqsVal,
                misses: l2PutsVal > 0 ? Math.max(0, l2ReqsVal - l2PutsVal) : 0,
            },
            queryCache: {
                puts: queryPutsVal,
                hits: queryReqsVal,
                misses: queryPutsVal > 0 ? Math.max(0, queryReqsVal - queryPutsVal) : 0,
            },
            queryPlanHits: getValue(queryPlan, 'COUNT'),
        };
    },
};
