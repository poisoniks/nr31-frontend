export interface EventType {
    id: number;
    name: Record<string, string>;
    customIcon?: string;
}

export interface UnitType {
    id: number;
    name: Record<string, string>;
    description?: Record<string, string>;
    customIcon?: string;
}

export interface CalendarEventDTO {
    id: string;
    seriesId?: string;
    title: Record<string, string>;
    description?: Record<string, string>;
    start: string;
    end?: string;
    type: EventType;
    serverName?: string;
    participatingUnits?: UnitType[];
    source?: 'SITE' | 'DISCORD';
    discordId?: string;
    cancelled?: boolean;
    recurring?: boolean;
}

export type UpdateMode = 'SINGLE' | 'ALL' | 'FUTURE';

export interface UpdateEventRequest {
    mode: UpdateMode;
    title?: Record<string, string>;
    description?: Record<string, string>;
    start: string;
    end?: string;
    originalStart?: string;
    type: number;
    serverName: string;
    participatingUnits?: number[];
    recurrence?: {
        frequency?: string;
        interval?: number;
        until?: string;
        byDay?: string[];
    };
}

export interface SupportedLocaleDTO {
    id: number;
    code: string;
    description: string;
}
