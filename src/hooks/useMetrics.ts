import { useState, useEffect, useCallback, useRef } from 'react';
import { metricsApi } from '../api/metricsApi';
import type {
    CacheMetrics,
    HibernateMetrics,
} from '../api/metricsApi';
import { hostMetricsApi } from '../api/hostMetricsApi';
import type { HostMetricsResponse } from '../api/hostMetricsApi';
import { useUIStore } from '../store/useUIStore';

export type SectionKey = 'spring' | 'hibernate';

interface SectionState<T> {
    data: T | null;
    loading: boolean;
}

export interface UseMetricsResult {
    hostMetrics: SectionState<HostMetricsResponse>;
    spring: SectionState<CacheMetrics[]>;
    hibernate: SectionState<HibernateMetrics>;
    openSections: Set<SectionKey>;
    refreshing: boolean;
    fetchedAt: Date | null;
    isLive: boolean;
    setIsLive: (live: boolean) => void;
    toggleSection: (key: SectionKey, open: boolean) => void;
    refresh: () => void;
}

export const useMetrics = (): UseMetricsResult => {
    const setError = useUIStore((s) => s.setError);

    // Host & Container Metrics (Eager load on mount)
    const [hostMetricsData, setHostMetricsData] = useState<HostMetricsResponse | null>(null);
    const [hostMetricsLoading, setHostMetricsLoading] = useState(true);

    // Lazy sections
    const [springData, setSpringData] = useState<CacheMetrics[] | null>(null);
    const [springLoading, setSpringLoading] = useState(false);

    const [hibernateData, setHibernateData] = useState<HibernateMetrics | null>(null);
    const [hibernateLoading, setHibernateLoading] = useState(false);

    const [openSections, setOpenSections] = useState<Set<SectionKey>>(new Set());
    const [refreshing, setRefreshing] = useState(false);
    const refreshingRef = useRef(false);
    const [fetchedAt, setFetchedAt] = useState<Date | null>(null);
    const [isLive, setIsLive] = useState(false);

    // Tracks which sections have been fetched at least once (avoids re-skeleton on refresh).
    const everFetched = useRef<Set<SectionKey>>(new Set());

    const loadHostMetrics = useCallback(
        async (isRefresh = false) => {
            if (!isRefresh) setHostMetricsLoading(true);
            try {
                const data = await hostMetricsApi.fetchHostMetrics();
                setHostMetricsData(data);
                setFetchedAt(new Date());
            } catch {
                setError('admin.overview.infra.error');
            } finally {
                if (!isRefresh) setHostMetricsLoading(false);
            }
        },
        [setError],
    );

    const loadSpring = useCallback(
        async (isRefresh = false) => {
            if (!isRefresh) setSpringLoading(true);
            try {
                const data = await metricsApi.fetchSpringCacheMetrics();
                setSpringData(data);
            } catch {
                setError('admin.overview.error');
            } finally {
                if (!isRefresh) setSpringLoading(false);
            }
        },
        [setError],
    );

    const loadHibernate = useCallback(
        async (isRefresh = false) => {
            if (!isRefresh) setHibernateLoading(true);
            try {
                const data = await metricsApi.fetchHibernateMetrics();
                setHibernateData(data);
            } catch {
                setError('admin.overview.error');
            } finally {
                if (!isRefresh) setHibernateLoading(false);
            }
        },
        [setError],
    );

    // ── Initial load — host metrics only ───────────────────────────────────

    useEffect(() => {
        loadHostMetrics();
    }, [loadHostMetrics]);

    // ── Toggle: triggers first-time fetch when a section opens ────────────

    const toggleSection = useCallback(
        (key: SectionKey, open: boolean) => {
            setOpenSections((prev) => {
                const next = new Set(prev);
                if (open) next.add(key);
                else next.delete(key);
                return next;
            });

            if (open && !everFetched.current.has(key)) {
                everFetched.current.add(key);
                if (key === 'spring') loadSpring();
                else if (key === 'hibernate') loadHibernate();
            }
        },
        [loadSpring, loadHibernate],
    );

    const refresh = useCallback(async () => {
        if (refreshingRef.current) return;
        refreshingRef.current = true;
        setRefreshing(true);
        const promises: Promise<void>[] = [loadHostMetrics(true)];
        if (openSections.has('spring')) promises.push(loadSpring(true));
        if (openSections.has('hibernate')) promises.push(loadHibernate(true));
        await Promise.allSettled(promises);
        setFetchedAt(new Date());
        setRefreshing(false);
        refreshingRef.current = false;
    }, [openSections, loadHostMetrics, loadSpring, loadHibernate]);

    // ── Live Update (SSE for host metrics, polling for open actuator sections) ────

    useEffect(() => {
        if (!isLive) return;

        // Start SSE stream for host metrics
        const unsubscribe = hostMetricsApi.createHostMetricsStream(
            (data) => {
                setHostMetricsData(data);
                setFetchedAt(new Date());
            },
            (err) => {
                console.error('SSE Error:', err);
                setError('admin.overview.infra.error');
            }
        );

        // Standard polling interval for active/open Actuator metrics
        const timer = setInterval(() => {
            const promises: Promise<void>[] = [];
            if (openSections.has('spring')) promises.push(loadSpring(true));
            if (openSections.has('hibernate')) promises.push(loadHibernate(true));
            if (promises.length > 0) {
                Promise.allSettled(promises);
            }
        }, 2000);

        return () => {
            unsubscribe();
            clearInterval(timer);
        };
    }, [isLive, openSections, loadSpring, loadHibernate, setError]);

    return {
        hostMetrics: { data: hostMetricsData, loading: hostMetricsLoading },
        spring: { data: springData, loading: springLoading },
        hibernate: { data: hibernateData, loading: hibernateLoading },
        openSections,
        refreshing,
        fetchedAt,
        isLive,
        setIsLive,
        toggleSection,
        refresh,
    };
};

