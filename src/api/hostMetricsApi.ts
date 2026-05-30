import api from './axiosConfig';
import { env } from '../config/environment';

export interface HostInfo {
    cpuCores: number;
    cpuUsagePercent: number;
    memoryTotalBytes: number;
    memoryUsedBytes: number;
    memoryAvailableBytes: number;
    diskTotalBytes: number;
    diskUsedBytes: number;
    diskAvailableBytes: number;
}

export interface ContainerInfo {
    id: string;
    name: string;
    service: string;
    status: string;
    startedAt: string;
    restartCount: number;
    cpuPercent: number;
    memoryUsedBytes: number;
    memoryLimitBytes: number;
}

export interface VolumeInfo {
    name: string;
    sizeBytes: number;
}

export interface HostMetricsResponse {
    host: HostInfo;
    containers: ContainerInfo[];
    volumes: VolumeInfo[];
    collectedAt: string;
}

export const hostMetricsApi = {
    fetchHostMetrics: async (): Promise<HostMetricsResponse> => {
        const response = await api.get<HostMetricsResponse>('/v1/admin/host-metrics');
        return response.data;
    },

    fetchHostMetricsHistory: async (): Promise<HostMetricsResponse[]> => {
        const response = await api.get<HostMetricsResponse[]>('/v1/admin/host-metrics/history');
        return response.data;
    },

    createHostMetricsStream: (
        onMessage: (data: HostMetricsResponse) => void,
        onError: (err: any) => void
    ): (() => void) => {
        const controller = new AbortController();
        const token = localStorage.getItem('token');
        
        const url = `${env.API_BASE_URL}/v1/admin/host-metrics/stream`;
        const headers: HeadersInit = {
            'Accept': 'text/event-stream',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        (async () => {
            try {
                const response = await fetch(url, {
                    headers,
                    signal: controller.signal,
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const reader = response.body?.getReader();
                if (!reader) {
                    throw new Error('Response body is not readable');
                }

                const decoder = new TextDecoder('utf-8');
                let buffer = '';

                while (true) {
                    const { value, done } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || ''; // Keep the last partial line in the buffer

                    for (const line of lines) {
                        const trimmed = line.trim();
                        if (trimmed.startsWith('data:')) {
                            const dataStr = trimmed.slice(5).trim();
                            if (dataStr) {
                                try {
                                    const parsed = JSON.parse(dataStr);
                                    onMessage(parsed);
                                } catch (e) {
                                    console.error('Error parsing SSE message JSON:', e, dataStr);
                                }
                            }
                        }
                    }
                }
            } catch (err: any) {
                if (err.name !== 'AbortError') {
                    onError(err);
                }
            }
        })();

        return () => {
            controller.abort();
        };
    }
};
