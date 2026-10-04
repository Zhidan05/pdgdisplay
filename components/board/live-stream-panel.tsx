"use client";
import { useState, useEffect, useRef } from "react";
import { AudioLines, VolumeX, Play } from "lucide-react";
import {
  ChannelLogo,
} from "@/components/shared/broadcast-ui";
import { MediaImage } from "@/components/shared/media-image";
import { hasStream, parseYouTubeVideoId, isVideoStreamUrl } from "@/lib/broadcast";
import type { Schedule, Station } from "@/data/types";
import { useOptionalAudio } from "./audio-context";

export type StreamRenderMode = "broadcast" | "preview";

export function OfflineFallback({
  image,
  message = "Siaran sedang tidak tersedia",
  actionButton,
  onAction,
}: {
  image: string;
  message?: string;
  actionButton?: React.ReactNode;
  onAction?: () => void;
}) {
  const isValidImage = image && image.trim() !== "" && !image.includes("studio.jpg");
  return (
    <div className="offline-fallback">
      {isValidImage && (
        <MediaImage
          key={image}
          src={image}
          alt="Gedung RRI Padang — referensi visual"
          priority
        />
      )}
      <div
        className="offline-message"
        onClick={onAction}
        style={{ cursor: onAction ? "pointer" : "default" }}
      >
        <img
          src="/rri/rri.png"
          alt="RRI Logo"
          style={{ height: 32, width: "auto", objectFit: "contain", marginBottom: 16, filter: "brightness(0) invert(1)", opacity: 0.95 }}
        />
        <span>Sekali di Udara, Tetap di Udara</span>
        <h2>{message}</h2>
        {actionButton && (
          <div className="offline-action" style={{ marginTop: 12 }}>
            {actionButton}
          </div>
        )}
      </div>
    </div>
  );
}
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

function YouTubePlayer({ videoId, onFail, mode }: { videoId: string, onFail: () => void, mode: StreamRenderMode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any>(null);
  const audio = useOptionalAudio();
  const initTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isPreview = mode === "preview" || !audio;

  // Initialize player ONLY ONCE when component mounts
  useEffect(() => {
    let isMounted = true;

    if (!containerRef.current) return;
    // Create an inner div for YouTube to replace, isolating it from React's DOM management
    containerRef.current.innerHTML = '<div></div>';
    const targetDiv = containerRef.current.firstElementChild as HTMLElement;

    function initPlayer() {
      if (!isMounted || playerRef.current) return;
      playerRef.current = new window.YT.Player(targetDiv, {
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          mute: isPreview ? 1 : (audio.preferredSoundEnabled ? 0 : 1)
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
          onError: onFail
        }
      });
    }

    if (!window.YT) {
      let script = document.getElementById("youtube-api-script") as HTMLScriptElement;
      if (!script) {
        script = document.createElement("script");
        script.id = "youtube-api-script";
        script.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName("script")[0];
        firstScriptTag.parentNode?.insertBefore(script, firstScriptTag);
      }

      const originalReady = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (originalReady) originalReady();
        if (isMounted) initPlayer();
      };
    } else if (window.YT && window.YT.Player) {
      initPlayer();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function onPlayerReady(event: any) {
      if (!isMounted) return;
      const player = event.target;

      if (isPreview) {
        player.mute();
        return;
      }

      player.setVolume(audio.volume);

      if (audio.preferredSoundEnabled) {
        player.unMute();
        player.playVideo();

        initTimeoutRef.current = setTimeout(() => {
          if (isMounted && player.getPlayerState() !== 1 && player.getPlayerState() !== 3) {
            audio.setAutoplayBlocked(true);
            audio.setActualSoundEnabled(false);
            player.mute();
            player.playVideo();
          }
        }, 1500);
      } else {
        player.mute();
        player.playVideo();
        audio.setActualSoundEnabled(false);
      }

      audio.registerRetryCallback(() => {
        if (!isMounted) return;
        if (player && player.unMute) {
          player.unMute();
          player.setVolume(audio.volume);
          player.playVideo();
          // Check state after programmatic unmute
          setTimeout(() => {
            if (isMounted && player && typeof player.isMuted === 'function') {
              audio.setActualSoundEnabled(!player.isMuted());
              if (!player.isMuted()) audio.setAutoplayBlocked(false);
            }
          }, 100);
        }
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function onPlayerStateChange(event: any) {
      if (!isMounted || isPreview) return;
      if (event.data === 1) { // PLAYING
        const player = event.target;
        if (player.isMuted()) {
          audio.setActualSoundEnabled(false);
        } else {
          audio.setActualSoundEnabled(true);
          audio.setAutoplayBlocked(false);
          if (initTimeoutRef.current) clearTimeout(initTimeoutRef.current);
        }
      }
    }

    return () => {
      isMounted = false;
      if (initTimeoutRef.current) clearTimeout(initTimeoutRef.current);
      try {
        if (playerRef.current && typeof playerRef.current.destroy === 'function') {
          playerRef.current.destroy();
        }
      } catch {
        // ignore external player teardown errors
      }
      playerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run ONLY once to mount the player

  // Handle videoId updates without recreating the player
  useEffect(() => {
    if (playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
      playerRef.current.loadVideoById(videoId);
    }
  }, [videoId]);

  // Update volume and mute state dynamically if user changes it via context
  useEffect(() => {
    if (isPreview) return;
    if (playerRef.current && typeof playerRef.current.setVolume === 'function') {
      playerRef.current.setVolume(audio.volume);
      if (audio.preferredSoundEnabled) {
        playerRef.current.unMute();
        // Verify if unmute was successful (browser might still block if no interaction)
        setTimeout(() => {
          if (playerRef.current && typeof playerRef.current.isMuted === 'function') {
            const muted = playerRef.current.isMuted();
            audio.setActualSoundEnabled(!muted);
            if (muted) audio.setAutoplayBlocked(true);
          }
        }, 100);
      } else {
        playerRef.current.mute();
        audio.setActualSoundEnabled(false);
      }
    }
  }, [audio?.preferredSoundEnabled, audio?.volume, isPreview]);

  return <div ref={containerRef} className="stream-video" />;
}

function HtmlVideoPlayer({ url, onFail, mode }: { url: string, onFail: () => void, mode: StreamRenderMode }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audio = useOptionalAudio();
  const isPreview = mode === "preview" || !audio;

  useEffect(() => {
    let isMounted = true;
    const video = videoRef.current;
    if (!video) return;

    if (isPreview) {
      video.muted = true;
      video.play().catch(() => { });
      return;
    }

    video.volume = audio.volume / 100;

    const playWithAudio = async () => {
      if (audio.preferredSoundEnabled) {
        video.muted = false;
        try {
          await video.play();
          if (isMounted) {
            audio.setActualSoundEnabled(true);
            audio.setAutoplayBlocked(false);
          }
        } catch (err) {
          if (err instanceof DOMException && err.name === 'NotAllowedError') {
            video.muted = true;
            if (isMounted) {
              audio.setActualSoundEnabled(false);
              audio.setAutoplayBlocked(true);
            }
            try {
              await video.play();
            } catch {
              // ignore
            }
          }
        }
      } else {
        video.muted = true;
        try {
          await video.play();
          if (isMounted) audio.setActualSoundEnabled(false);
        } catch {
          // ignore
        }
      }
    };

    playWithAudio();

    audio.registerRetryCallback(() => {
      if (!isMounted) return;
      video.muted = false;
      video.volume = audio.volume / 100;
      video.play().then(() => {
        if (isMounted) {
          audio.setActualSoundEnabled(true);
          audio.setAutoplayBlocked(false);
        }
      }).catch(() => {
        video.muted = true;
        if (isMounted) {
          audio.setActualSoundEnabled(false);
          audio.setAutoplayBlocked(true);
        }
      });
    });

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]); // Only run once on mount or url change

  useEffect(() => {
    if (isPreview) return;
    const video = videoRef.current;
    if (video) {
      video.volume = audio.volume / 100;
      if (audio.preferredSoundEnabled) {
        video.muted = false;
        video.play().then(() => {
          audio.setActualSoundEnabled(true);
          audio.setAutoplayBlocked(false);
        }).catch(() => {
          video.muted = true;
          audio.setActualSoundEnabled(false);
          audio.setAutoplayBlocked(true);
        });
      } else {
        video.muted = true;
        audio.setActualSoundEnabled(false);
      }
    }
  }, [audio?.volume, audio?.preferredSoundEnabled, isPreview]);

  return (
    <video
      ref={videoRef}
      className="stream-video"
      src={url}
      loop
      playsInline
      onError={onFail}
      aria-label="Video siaran"
    />
  );
}

function RriAudioPlayer({
  url,
  fallbackImage,
  mode,
  onFail,
}: {
  url: string;
  fallbackImage: string;
  mode: StreamRenderMode;
  onFail?: () => void;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioCtx = useOptionalAudio();
  const isPreview = mode === "preview" || !audioCtx;
  const hasEverPlayedRef = useRef(false);
  const [status, setStatus] = useState<
    "connecting" | "playing" | "blocked" | "buffering" | "error"
  >(isPreview ? "blocked" : "connecting");

  const retryCountRef = useRef(0);
  const MAX_RETRIES = 3;

  const startPlayback = () => {
    const audio = audioRef.current;
    if (!audio) return;

    retryCountRef.current = 0;
    audio.muted = false;
    audio.volume = isPreview ? 0 : ((audioCtx ? audioCtx.volume : 80) / 100);
    setStatus("connecting");

    audio.play().catch((err) => {
      if (err instanceof DOMException && (err.name === "NotAllowedError" || err.name === "AbortError")) {
        setStatus("blocked");
        if (audioCtx && !isPreview) {
          audioCtx.setActualSoundEnabled(false);
          audioCtx.setAutoplayBlocked(true);
        }
      } else {
        setStatus("error");
        onFail?.();
      }
    });
  };

  useEffect(() => {
    let isMounted = true;
    const audio = audioRef.current;
    if (!audio) return;

    hasEverPlayedRef.current = false;

    audio.src = url;
    audio.preload = "auto";
    audio.volume = isPreview ? 0 : ((audioCtx ? audioCtx.volume : 80) / 100);
    audio.muted = isPreview ? true : !(audioCtx ? audioCtx.preferredSoundEnabled : true);

    if (isPreview) {
      return;
    }

    const onPlaying = () => {
      if (!isMounted) return;
      hasEverPlayedRef.current = true;
      retryCountRef.current = 0;
      setStatus("playing");
      if (audioCtx && !isPreview) {
        audioCtx.setActualSoundEnabled(true);
        audioCtx.setAutoplayBlocked(false);
      }
    };

    const onError = () => {
      if (!isMounted) return;
      if (retryCountRef.current < MAX_RETRIES) {
        retryCountRef.current += 1;
        setStatus("connecting");
        setTimeout(() => {
          if (!isMounted) return;
          audio.load();
          audio.play().catch(() => { });
        }, 1500 * retryCountRef.current);
      } else {
        setStatus("error");
        onFail?.();
      }
    };

    const onWaiting = () => {
      if (!isMounted) return;
      if (status === "playing") {
        setStatus("buffering");
      }
    };

    const onStalled = () => {
      if (!isMounted) return;
      if (hasEverPlayedRef.current && status === "playing") {
        setStatus("buffering");
      }
    };

    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("error", onError);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("stalled", onStalled);

    if (audioCtx && !isPreview) {
      audioCtx.registerRetryCallback(() => {
        if (!isMounted) return;
        startPlayback();
      });
    }

    audio
      .play()
      .then(() => {
        // Playback requested, 'playing' event will trigger when stream actually plays
      })
      .catch((err) => {
        if (!isMounted) return;
        if (err instanceof DOMException && (err.name === "NotAllowedError" || err.name === "AbortError")) {
          setStatus("blocked");
          if (audioCtx) {
            audioCtx.setActualSoundEnabled(false);
            audioCtx.setAutoplayBlocked(true);
          }
        } else {
          setStatus("error");
        }
      });

    return () => {
      isMounted = false;
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("error", onError);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("stalled", onStalled);
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, isPreview]);

  useEffect(() => {
    if (isPreview || !audioCtx) return;
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = audioCtx.volume / 100;
    if (audioCtx.preferredSoundEnabled) {
      audio.muted = false;
      if (audio.paused && (status === "playing" || status === "blocked")) {
        audio.play().catch(() => { });
      }
    } else {
      audio.muted = true;
    }
  }, [audioCtx?.volume, audioCtx?.preferredSoundEnabled, isPreview, status]);

  let message = "Siaran sedang tidak tersedia";
  let showAction = false;

  switch (status) {
    case "connecting":
      message = "Menghubungkan ke streaming RRI...";
      break;
    case "playing":
      message = "Siaran radio sedang diputar";
      break;
    case "blocked":
      message = "Tekan untuk memulai siaran";
      showAction = true;
      break;
    case "buffering":
      message = "Menyambungkan kembali...";
      break;
    case "error":
      message = "Siaran sementara tidak tersedia";
      break;
  }

  const actionButton = showAction ? (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        startPlayback();
      }}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[var(--accent)] hover:bg-[#e06c00] active:scale-95 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
      aria-label="Mulai siaran audio"
    >
      <Play size={14} className="fill-current" />
      <span>PUTAR SIARAN</span>
    </button>
  ) : null;

  return (
    <>
      <audio ref={audioRef} className="hidden" aria-hidden="true" />
      <OfflineFallback
        image={fallbackImage}
        message={message}
        actionButton={actionButton}
        onAction={showAction ? startPlayback : undefined}
      />
    </>
  );
}

function StreamMedia({
  youtubeUrl,
  rriUrl,
  streamUrl,
  fallbackImage,
  mode,
}: {
  youtubeUrl?: string | null;
  rriUrl?: string | null;
  streamUrl?: string | null;
  fallbackImage: string;
  mode: StreamRenderMode;
}) {
  const [youtubeFailed, setYoutubeFailed] = useState(false);
  const [rriFailed, setRriFailed] = useState(false);
  const [lastYt, setLastYt] = useState(youtubeUrl);
  const [lastRri, setLastRri] = useState(rriUrl);

  if (youtubeUrl !== lastYt) {
    setLastYt(youtubeUrl);
    setYoutubeFailed(false);
  }
  if (rriUrl !== lastRri) {
    setLastRri(rriUrl);
    setRriFailed(false);
  }

  const cleanYt = youtubeUrl?.trim() || null;
  const cleanRri = rriUrl?.trim() || null;
  const cleanStream = streamUrl?.trim() || null;

  const ytVideoId = cleanYt ? parseYouTubeVideoId(cleanYt) : null;
  const fallbackYtVideoId = !ytVideoId && cleanStream ? parseYouTubeVideoId(cleanStream) : null;
  const activeYtVideoId = ytVideoId || fallbackYtVideoId;

  // Priority logic:
  // 1. YouTube if provided and hasn't failed
  const shouldPlayYouTube = Boolean(activeYtVideoId && !youtubeFailed);

  // 2. RRI if YouTube is empty (or failed) and RRI is provided and hasn't failed
  const shouldPlayRri = Boolean(
    (!shouldPlayYouTube || youtubeFailed) &&
    cleanRri &&
    !rriFailed
  );

  // 3. Fallback to legacy video if any
  const shouldPlayLegacyVideo = Boolean(
    !shouldPlayYouTube &&
    !shouldPlayRri &&
    cleanStream &&
    isVideoStreamUrl(cleanStream)
  );

  if (shouldPlayYouTube && activeYtVideoId) {
    return (
      <YouTubePlayer
        key={activeYtVideoId}
        videoId={activeYtVideoId}
        onFail={() => setYoutubeFailed(true)}
        mode={mode}
      />
    );
  }

  if (shouldPlayRri && cleanRri) {
    return (
      <RriAudioPlayer
        key={cleanRri}
        url={cleanRri}
        fallbackImage={fallbackImage}
        mode={mode}
        onFail={() => setRriFailed(true)}
      />
    );
  }

  if (shouldPlayLegacyVideo && cleanStream) {
    return (
      <HtmlVideoPlayer
        key={cleanStream}
        url={cleanStream}
        onFail={() => setRriFailed(true)}
        mode={mode}
      />
    );
  }

  return (
    <OfflineFallback
      image={fallbackImage}
      message="Siaran sedang tidak tersedia"
    />
  );
}

export function LiveStreamPanel({
  station,
  current,
  fallbackImage,
  compact = false,
  mode,
}: {
  station: Station;
  current?: Schedule;
  fallbackImage: string;
  compact?: boolean;
  mode?: StreamRenderMode;
}) {
  const available =
    hasStream(station.youtubeUrl) ||
    hasStream(station.rriUrl) ||
    hasStream(station.streamUrl);

  return (
    <section
      className={`live-panel panel ${compact ? "compact-live" : ""}`}
      aria-label={`Siaran ${station.id}`}
    >
      <div className="live-media">
        {available ? (
          <StreamMedia
            key={station.id}
            youtubeUrl={station.youtubeUrl}
            rriUrl={station.rriUrl}
            streamUrl={station.streamUrl}
            fallbackImage={fallbackImage}
            mode={mode || "broadcast"}
          />
        ) : (
          <OfflineFallback image={fallbackImage} message="Siaran sedang tidak tersedia" />
        )}
        <div className="live-top">
          <div className="flex flex-col items-center gap-1.5 drop-shadow-md">
            <ChannelLogo channel={station.id} />
            {available && (
              <span className="text-[11px] font-bold tracking-[0.2em] text-white uppercase" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}>
                LIVE
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="live-footer">
        <span>
          {available ? <AudioLines size={16} /> : <VolumeX size={16} />}
          {station.name} <b>•</b> {station.frequency}
        </span>
        <span>
          {current ? `${current.start}–${current.end}` : "Suara Indonesia"}
        </span>
      </div>
    </section>
  );
}
