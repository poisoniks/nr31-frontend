import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Youtube } from 'lucide-react';
import { cmsApi } from '../../api/cmsApi';
import type { YoutubeVideoDto } from '../../api/cmsApi';

interface YoutubeWidgetProps {
    channelId: string;
}

const YoutubeWidget: React.FC<YoutubeWidgetProps> = ({ channelId }) => {
    const { t } = useTranslation();
    const [latestVideo, setLatestVideo] = useState<YoutubeVideoDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!channelId) {
            setLoading(false);
            return;
        }

        const fetchVideo = async () => {
            try {
                setLoading(true);
                const video = await cmsApi.getYoutubeVideo(channelId);
                setLatestVideo(video);
            } catch (err) {
                console.error("Error fetching YouTube feed from backend:", err);
                setError(t('youtube.error', 'Error loading video'));
            } finally {
                setLoading(false);
            }
        };

        fetchVideo();
    }, [t, channelId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center glass-card text-nr-text w-full h-full min-h-[300px] font-sans text-sm transition-colors duration-200 border border-nr-border/50 rounded-xl">
                <div className="w-8 h-8 border-4 border-nr-accent border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !latestVideo) {
        return (
            <div className="flex items-center justify-center glass-card text-nr-text w-full h-full min-h-[300px] font-sans text-sm p-4 transition-colors duration-200 border border-nr-border/50 rounded-xl">
                <div className="text-center opacity-70">
                    <Youtube size={32} className="mx-auto mb-2 opacity-50 text-nr-accent" />
                    <p>{error || t('youtube.no_videos', 'No recent videos found')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col glass-card text-nr-text w-full h-full min-h-[300px] font-sans text-sm transition-colors duration-200 shadow-none border border-nr-border/50 rounded-xl overflow-hidden pointer-events-auto">
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
                <div className={`w-full relative ${latestVideo.short ? 'aspect-[9/16] max-w-[350px] mx-auto' : 'aspect-video'}`}>
                    <iframe
                        className="absolute top-0 left-0 w-full h-full"
                        src={`https://www.youtube-nocookie.com/embed/${latestVideo.videoId}`}
                        title={latestVideo.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; compute-pressure"
                        allowFullScreen
                    ></iframe>
                </div>
            </div>
        </div>
    );
};

export default YoutubeWidget;
