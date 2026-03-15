export interface EventType {
    id: number;
    name: Record<string, string>;
    customIcon?: string;
}

export interface UnitType {
    id: number;
    name: Record<string, string>;
    description?: Record<string, string>;
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
    recurring?: boolean;
}
