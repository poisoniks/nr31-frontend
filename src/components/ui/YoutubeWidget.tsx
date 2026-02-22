import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Youtube } from 'lucide-react';

interface VideoData {
    id: string;
    title: string;
    link: string;
    published: Date;
    author: string;
    isShort: boolean;
}

const CHANNELS = ['UCbU41G2hhiwdn-gFFRqZN4w', 'UC3tNYFX1bqhA6tez9gYHbxA'];

const YoutubeWidget: React.FC = () => {
    const { t } = useTranslation();
    const [latestVideo, setLatestVideo] = useState<VideoData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                setLoading(true);
                const videos: VideoData[] = [];

                for (const channelId of CHANNELS) {
                    try {
                        const rssUrl = encodeURIComponent(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`);
                        const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}`);
                        if (!response.ok) {
                            console.error(`Failed to fetch JSON for channel ${channelId}`);
                            continue;
                        }
                        const data = await response.json();

                        if (data.status === 'ok' && data.items && data.items.length > 0) {
                            for (const item of data.items) {
                                let videoId = '';
                                if (item.guid && item.guid.includes('yt:video:')) {
                                    videoId = item.guid.split(':')[2];
                                } else if (item.link && item.link.includes('v=')) {
                                    videoId = item.link.split('v=')[1].split('&')[0];
                                }

                                const title = item.title || '';
                                const publishedText = item.pubDate || '';
                                const author = item.author || (data.feed && data.feed.title) || '';
                                const link = item.link || '';
                                const isShort = link.includes('/shorts/');

                                if (videoId && title && publishedText) {
                                    videos.push({
                                        id: videoId,
                                        title,
                                        link: `https://www.youtube.com/watch?v=${videoId}`,
                                        published: new Date(publishedText),
                                        author,
                                        isShort
                                    });
                                }
                            }
                        }
                    } catch (channelErr) {
                        console.error(`Error processing channel ${channelId}:`, channelErr);
                    }
                }

                videos.sort((a, b) => b.published.getTime() - a.published.getTime());

                if (videos.length > 0) {
                    setLatestVideo(videos[0]);
                } else {
                    setError(t('youtube.no_videos'));
                }
            } catch (err) {
                console.error("Error fetching YouTube feed:", err);
                setError(t('youtube.error'));
            } finally {
                setLoading(false);
            }
        };

        fetchVideos();
    }, [t]);

    if (loading) {
        return (
            <div className="flex items-center justify-center bg-transparent text-nr-text w-full h-full min-h-[300px] font-sans text-sm transition-colors duration-200">
                <div className="w-8 h-8 border-4 border-nr-accent border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !latestVideo) {
        return (
            <div className="flex items-center justify-center bg-transparent text-nr-text w-full h-full min-h-[300px] font-sans text-sm p-4 transition-colors duration-200">
                <div className="text-center opacity-70">
                    <Youtube size={32} className="mx-auto mb-2 opacity-50 text-nr-accent" />
                    <p>{error || t('youtube.no_videos', 'No recent videos found')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col bg-transparent text-nr-text w-full h-full font-sans text-sm transition-colors duration-200 shadow-none">
            {/* Header */}
            <div className="flex flex-col border-b border-nr-border/50 p-3 shrink-0 transition-colors duration-200">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-black/10 dark:bg-black/40 flex items-center justify-center shrink-0 border border-nr-border/50 transition-colors duration-200">
                        <Youtube className="text-[#ff0000] w-6 h-6" />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="font-bold text-nr-text truncate text-sm drop-shadow-sm transition-colors duration-200">
                            {t('youtube.latest_video', 'Latest Video')}
                        </span>
                        <span className="text-xs text-nr-text/70 truncate transition-colors duration-200">
                            {latestVideo.author}
                        </span>
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="flex-1 flex flex-col items-center justify-center w-full relative">
                {/* Player Wrapper */}
                <div className={`w-full relative ${latestVideo.isShort ? 'aspect-[9/16] max-w-[350px] mx-auto' : 'aspect-video'}`}>
                    <iframe
                        className="absolute top-0 left-0 w-full h-full"
                        src={`https://www.youtube.com/embed/${latestVideo.id}`}
                        title={latestVideo.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                    ></iframe>
                </div>
            </div>
        </div>
    );
};

export default YoutubeWidget;
