'use client';

import { useState, useMemo } from 'react';
import { Play, X, ExternalLink } from 'lucide-react';

interface VideoPlayerProps {
  url: string;
  title?: string;
  compact?: boolean;
  className?: string;
}

function parseYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function isDirectVideo(url: string): boolean {
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);
}

export function VideoPlayer({ url, title, compact = false, className = '' }: VideoPlayerProps) {
  const [playing, setPlaying] = useState(false);

  const youtubeId = useMemo(() => parseYouTubeId(url), [url]);
  const isDirect = useMemo(() => isDirectVideo(url), [url]);

  if (!url) return null;

  // Compact thumbnail mode
  if (compact && !playing) {
    return (
      <button
        onClick={() => setPlaying(true)}
        className={`group relative overflow-hidden rounded-lg bg-neutral-900 ${className}`}
        aria-label={`Play ${title || 'video'}`}
      >
        {youtubeId ? (
          <img
            src={`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`}
            alt={title || 'Video thumbnail'}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-neutral-800">
            <Play size={20} className="text-neutral-400" />
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
          <div className="rounded-full bg-white/20 p-2 backdrop-blur-sm">
            <Play size={16} className="text-white" fill="white" />
          </div>
        </div>
      </button>
    );
  }

  // Full player
  if (youtubeId) {
    return (
      <div className={`relative overflow-hidden rounded-xl bg-black ${className}`}>
        {playing || !compact ? (
          <>
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=${playing ? 1 : 0}&rel=0&modestbranding=1`}
              title={title || 'Exercise video'}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="aspect-video w-full"
            />
            {playing && (
              <button
                onClick={() => setPlaying(false)}
                className="absolute right-2 top-2 rounded-full bg-black/60 p-1 backdrop-blur-sm transition-colors hover:bg-black/80"
              >
                <X size={16} className="text-white" />
              </button>
            )}
          </>
        ) : (
          <button
            onClick={() => setPlaying(true)}
            className="group relative aspect-video w-full"
          >
            <img
              src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`}
              alt={title || 'Video thumbnail'}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/40">
              <div className="rounded-full bg-white/25 p-4 backdrop-blur-sm">
                <Play size={32} className="text-white" fill="white" />
              </div>
            </div>
          </button>
        )}
      </div>
    );
  }

  if (isDirect) {
    return (
      <div className={`overflow-hidden rounded-xl bg-black ${className}`}>
        <video
          src={url}
          controls
          playsInline
          preload="metadata"
          className="aspect-video w-full"
        >
          <track kind="captions" />
        </video>
      </div>
    );
  }

  // Fallback: link to external video
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 p-3 text-sm text-primary-400 transition-colors hover:bg-neutral-800 ${className}`}
    >
      <ExternalLink size={16} />
      <span>{title || 'Watch video'}</span>
    </a>
  );
}

export { parseYouTubeId, isDirectVideo };
