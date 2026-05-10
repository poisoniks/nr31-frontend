import React from 'react';
import { Layout, Calendar, Newspaper, MessageSquare, MonitorPlay, Type } from 'lucide-react';
import type { WidgetDto } from '../../api/cmsApi';

import { HeroWidget } from './widgets/HeroWidget';
import { NextEventWidget } from './widgets/NextEventWidget';
import { NewsFeedWidget } from './widgets/NewsFeedWidget';
import { RichTextWidget } from './widgets/RichTextWidget';
import DiscordWidget from '../ui/DiscordWidget';
import YoutubeWidget from '../ui/YoutubeWidget';

export interface WidgetRegistryEntry {
    component: React.ComponentType<{ widget: WidgetDto; isEditMode: boolean }>;
    icon: React.ReactNode;
    labelKey: string;
}

export const widgetRegistry: Record<string, WidgetRegistryEntry> = {
    'hero': {
        component: HeroWidget,
        icon: <Layout size={18} />,
        labelKey: 'cms.widget.hero',
    },
    'richtext': {
        component: RichTextWidget,
        icon: <Type size={18} />,
        labelKey: 'cms.widget.rich_text',
    },
    'nextevent': {
        component: NextEventWidget,
        icon: <Calendar size={18} />,
        labelKey: 'cms.widget.next_event',
    },
    'newsfeed': {
        component: NewsFeedWidget,
        icon: <Newspaper size={18} />,
        labelKey: 'cms.widget.news_feed',
    },
    'discord': {
        component: ({ widget }) => (
            <div className="border border-nr-border/50 rounded-xl overflow-hidden min-h-[300px]">
                <DiscordWidget inviteCode={(widget as any).inviteCode} />
            </div>
        ),
        icon: <MessageSquare size={18} />,
        labelKey: 'cms.widget.discord',
    },
    'youtube': {
        component: ({ widget }) => (
            <div className="border border-nr-border/50 rounded-xl overflow-hidden bg-nr-bg min-h-[300px]">
                <YoutubeWidget channelId={(widget as any).channelId} />
            </div>
        ),
        icon: <MonitorPlay size={18} />,
        labelKey: 'cms.widget.youtube',
    },
};
