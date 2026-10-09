import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  ArrowLeft,
  SkipForward,
  List,
  X,
  ShieldCheck,
  ShieldAlert,
  Shield,
  CheckCircle2,
  Sparkles,
  Smartphone,
  ChevronDown,
  Check
} from 'lucide-react';
import { progressService } from '../services/progressService';
import { tmdbService } from '../services/tmdbService';
import { formatSeconds } from '../utils/formatTime';
import { useAdShield } from '../hooks/useAdShield';
import { Episode, Season } from '../types';
import { ref, set, remove, onDisconnect } from 'firebase/database';
import { rtdb } from '../config/firebase';
import { useAuth } from '../store/AuthContext';

import rotateIcon from '../assets/rotate.png';

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
  subtitle?: string;
  posterUrl?: string;
  backdropUrl?: string;
  movieId?: string;
  episodeId?: string;
  tmdbId?: number | string;
  seasonNumber?: number;
  episodeNumber?: number;
  initialProgressSeconds?: number;
  onNextEpisode?: () => void;
  hasNextEpisode?: boolean;
  episodesList?: Episode[];
  seasonsList?: Season[];
  onSelectEpisode?: (episodeId: string, seasonNumber?: number, episodeNumber?: number) => void;
  onSelectSeason?: (seasonNumber: number) => void;
  backUrl?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  title,
  subtitle,
  posterUrl,
  backdropUrl,
  movieId,
  episodeId,
  tmdbId,
  seasonNumber = 1,
  episodeNumber = 1,
  initialProgressSeconds = 0,
  onNextEpisode,
  hasNextEpisode = false,
  episodesList = [],
  seasonsList = [],
  onSelectEpisode,
  onSelectSeason,
  backUrl = '/',
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Activate Pixell Script-Based AdShield (Anti-Popup & Anti-Redirect)
  const {
    shieldActive,
    setShieldActive,
    blockedCount,
  } = useAdShield(true);

  // Determine initial server mode: if videoUrl is already a videasy or embed URL, or if we have tmdbId
  const isEmbedInitial = videoUrl.includes('videasy') || videoUrl.includes('vidsrc') || videoUrl.includes('embed');
  const [selectedServer, setSelectedServer] = useState<'videasy' | 'vidsrc' | 'direct'>(() => {
    if (videoUrl.includes('vidsrc')) return 'vidsrc';
    if (isEmbedInitial || tmdbId) return 'videasy';
    return 'direct';
  });

  // States
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isLandscape, setIsLandscape] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth > window.innerHeight;
    }
    return false;
  });

  // Check if current device is a mobile phone (portrait width < 600 or landscape height < 600 with touch/mobile UA)
  // Tablets (iPad min dimension >= 768px) and desktop PCs are excluded from mobile rotate button.
  const checkIsMobilePhone = () => {
    if (typeof window === 'undefined') return false;
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isMobileUA = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isCoarse = Boolean(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
    const isPhoneScreen = Math.min(window.innerWidth, window.innerHeight) < 600;
    return isPhoneScreen && (isTouch || isMobileUA || isCoarse);
  };

  const [isMobileDevice, setIsMobileDevice] = useState<boolean>(checkIsMobilePhone);
  const [controlsVisible, setControlsVisible] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [speedMenuOpen, setSpeedMenuOpen] = useState<boolean>(false);
  const [adShieldMenuOpen, setAdShieldMenuOpen] = useState<boolean>(false);
  const [episodesDrawerOpen, setEpisodesDrawerOpen] = useState<boolean>(false);
  const [drawerSeasonNumber, setDrawerSeasonNumber] = useState<number>(seasonNumber);
  const [drawerEpisodes, setDrawerEpisodes] = useState<Episode[]>(episodesList);
  const [drawerLoading, setDrawerLoading] = useState<boolean>(false);
  const [seasonDropdownOpen, setSeasonDropdownOpen] = useState<boolean>(false);
  const seasonDropdownRef = useRef<HTMLDivElement>(null);

  // Close custom season dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (seasonDropdownRef.current && !seasonDropdownRef.current.contains(e.target as Node)) {
        setSeasonDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Sync drawer state when episodesList or seasonNumber changes
  useEffect(() => {
    setDrawerSeasonNumber(seasonNumber);
    setDrawerEpisodes(episodesList);
  }, [episodesList, seasonNumber]);

  // Load season episodes when switching season inside drawer
  const handleDrawerSeasonChange = async (newSeasonNum: number) => {
    setDrawerSeasonNumber(newSeasonNum);
    setSeasonDropdownOpen(false);
    if (newSeasonNum === seasonNumber) {
      setDrawerEpisodes(episodesList);
      return;
    }

    if (tmdbId) {
      try {
        setDrawerLoading(true);
        const res = await tmdbService.getSeasonEpisodes(tmdbId, newSeasonNum);
        if (res.success && res.data) {
          setDrawerEpisodes(res.data);
        }
      } catch (err) {
        console.error('Failed to load season episodes:', err);
      } finally {
        setDrawerLoading(false);
      }
    }
  };
  const [hasResumed, setHasResumed] = useState<boolean>(false);
  const [errorState, setErrorState] = useState<string | null>(null);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track orientation changes and fullscreen state changes
  useEffect(() => {
    const handleOrientation = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
      setIsMobileDevice(checkIsMobilePhone());
    };
    const handleFsChange = () => {
      const isFs = Boolean(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      setIsFullscreen(isFs);
    };

    window.addEventListener('resize', handleOrientation);
    window.addEventListener('orientationchange', handleOrientation);
    if (screen.orientation) {
      screen.orientation.addEventListener('change', handleOrientation);
    }
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);

    return () => {
      window.removeEventListener('resize', handleOrientation);
      window.removeEventListener('orientationchange', handleOrientation);
      if (screen.orientation) {
        screen.orientation.removeEventListener('change', handleOrientation);
      }
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, []);

  // Compute embed URLs
  const getEmbedUrl = () => {
    if (selectedServer === 'videasy') {
      if (videoUrl.includes('player.videasy.ws') || videoUrl.includes('player.videasy.net')) {
        return videoUrl;
      }
      if (episodeId && tmdbId) {
        return `https://player.videasy.ws/embed/tv/${tmdbId}/${seasonNumber}/${episodeNumber}`;
      }
      if (tmdbId) {
        return `https://player.videasy.ws/embed/movie/${tmdbId}`;
      }
      return videoUrl;
    }

    if (selectedServer === 'vidsrc') {
      if (episodeId && tmdbId) {
        return `https://vidsrc.to/embed/tv/${tmdbId}/${seasonNumber}/${episodeNumber}`;
      }
      if (tmdbId) {
        return `https://vidsrc.to/embed/movie/${tmdbId}`;
      }
      return `https://vidsrc.to/embed/movie/${tmdbId || '299534'}`;
    }

    return videoUrl;
  };

  // Auto-hide controls after 2 seconds of inactivity
  const triggerControlsAutoHide = useCallback(() => {
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (!speedMenuOpen && !episodesDrawerOpen && !adShieldMenuOpen) {
        setControlsVisible(false);
      }
    }, 2000);
  }, [speedMenuOpen, episodesDrawerOpen, adShieldMenuOpen]);

  const showControls = useCallback(() => {
    setControlsVisible(true);
    triggerControlsAutoHide();
  }, [triggerControlsAutoHide]);


  // Initial auto-hide after 2 seconds on mount
  useEffect(() => {
    setControlsVisible(true);
    triggerControlsAutoHide();
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [triggerControlsAutoHide]);

  // Reveal controls when clicking into iframe embed
  useEffect(() => {
    let focusTimer: NodeJS.Timeout | null = null;
    const handleBlur = () => {
      showControls();
      if (focusTimer) clearTimeout(focusTimer);
      focusTimer = setTimeout(() => {
        try {
          window.focus();
        } catch { }
      }, 300);
    };
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('blur', handleBlur);
      if (focusTimer) clearTimeout(focusTimer);
    };
  }, [showControls]);

  // Initial resume position
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      if (initialProgressSeconds > 0 && !hasResumed) {
        video.currentTime = initialProgressSeconds;
        setHasResumed(true);
      }
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    return () => video.removeEventListener('loadedmetadata', handleLoadedMetadata);
  }, [initialProgressSeconds, hasResumed]);

  // Dedicated helper to immediately remove live stream radar entry
  const stopLiveStreamRadar = useCallback(() => {
    if (rtdb && user) {
      remove(ref(rtdb, `live_streams/${user.id}`)).catch(() => {});
    }
    progressService.stopLiveStream().catch(() => {});
  }, [user]);

  // Tab close & unmount radar presence cleanup
  useEffect(() => {
    if (rtdb && user) {
      const streamRef = ref(rtdb, `live_streams/${user.id}`);
      onDisconnect(streamRef).remove().catch(() => {});
    }

    const handleTabClose = () => {
      stopLiveStreamRadar();
    };

    window.addEventListener('beforeunload', handleTabClose);
    window.addEventListener('pagehide', handleTabClose);

    return () => {
      window.removeEventListener('beforeunload', handleTabClose);
      window.removeEventListener('pagehide', handleTabClose);
      stopLiveStreamRadar();
    };
  }, [user, stopLiveStreamRadar]);

  // Periodic watch progress & active live telemetry sync
  useEffect(() => {
    const isTv = Boolean(episodeId || (tmdbId && seasonNumber && episodeNumber));
    const mediaType: 'movie' | 'tv' = isTv ? 'tv' : 'movie';

    const saveCurrentProgress = (progressSec: number, durationSec: number, isLiveStatus: boolean) => {
      progressService.saveProgress({
        movieId,
        episodeId,
        tmdbId,
        mediaType,
        title,
        posterUrl,
        backdropUrl,
        seasonNumber: isTv ? seasonNumber : undefined,
        episodeNumber: isTv ? episodeNumber : undefined,
        progressSeconds: progressSec,
        durationSeconds: durationSec,
        isLive: isLiveStatus,
      }).catch(() => {});

      if (rtdb && user) {
        const streamRef = ref(rtdb, `live_streams/${user.id}`);
        if (isLiveStatus) {
          const percentage = durationSec > 0 ? Math.min(100, Math.round((progressSec / durationSec) * 100)) : 0;
          set(streamRef, {
            id: user.id,
            userId: user.id,
            userName: user.name,
            userEmail: user.email,
            userAvatar: user.avatar,
            itemTitle: title,
            mediaType,
            tmdbId: tmdbId ? String(tmdbId) : null,
            seasonNumber: isTv ? seasonNumber : null,
            episodeNumber: isTv ? episodeNumber : null,
            posterUrl: posterUrl || null,
            backdropUrl: backdropUrl || null,
            progressSeconds: progressSec,
            durationSeconds: durationSec,
            progressPercentage: percentage,
            isLive: true,
            updatedAt: new Date().toISOString()
          }).catch(() => {});
        } else {
          remove(streamRef).catch(() => {});
        }
      }
    };

    const isActuallyPlaying = isPlaying || selectedServer !== 'direct';

    if (isActuallyPlaying) {
      const getCur = () => (videoRef.current ? Math.floor(videoRef.current.currentTime) : (initialProgressSeconds || 60));
      const getDur = () => (videoRef.current && duration > 0 ? Math.floor(duration) : 7200);

      // Initial active ping
      saveCurrentProgress(getCur(), getDur(), true);

      const interval = setInterval(() => {
        const cur = getCur();
        const dur = getDur();
        saveCurrentProgress(cur, dur, true);
      }, 5000);

      return () => {
        clearInterval(interval);
        const cur = getCur();
        const dur = getDur();
        saveCurrentProgress(cur, dur, false);
        stopLiveStreamRadar();
      };
    } else {
      stopLiveStreamRadar();
    }
  }, [isPlaying, duration, movieId, episodeId, tmdbId, seasonNumber, episodeNumber, title, selectedServer, user, initialProgressSeconds, stopLiveStreamRadar]);

  // Play / Pause Toggle
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      stopLiveStreamRadar();
    } else {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
        setErrorState(null);
      }).catch((err) => {
        console.error('Playback error:', err);
        setErrorState('Unable to play this video source. Switch to Videasy server or try again.');
      });
    }
  };

  const skip = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      setIsMuted(newVol === 0);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.muted = false;
      videoRef.current.volume = volume || 1;
      setIsMuted(false);
    } else {
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = async () => {
    try {
      const container = containerRef.current || document.documentElement;
      const isCurrentlyFs = Boolean(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );

      if (!isCurrentlyFs) {
        if (container.requestFullscreen) {
          await container.requestFullscreen();
        } else if ((container as any).webkitRequestFullscreen) {
          await (container as any).webkitRequestFullscreen();
        } else if ((container as any).msRequestFullscreen) {
          await (container as any).msRequestFullscreen();
        } else if (videoRef.current && (videoRef.current as any).webkitEnterFullscreen) {
          (videoRef.current as any).webkitEnterFullscreen();
        }
        setIsFullscreen(true);

        // Try to lock orientation to landscape on devices that support Screen Orientation API
        if (screen.orientation && (screen.orientation as any).lock) {
          try {
            await (screen.orientation as any).lock('landscape');
          } catch {
            // Orientation lock unavailable or restricted by browser
          }
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }
        setIsFullscreen(false);
        if (screen.orientation && (screen.orientation as any).unlock) {
          try {
            (screen.orientation as any).unlock();
          } catch { }
        }
      }
    } catch (err) {
      console.warn('Fullscreen/orientation toggle failed:', err);
    }
  };

  const handleRotate = async () => {
    // Rotation is only available on mobile (not in desktop or tablet)
    if (!checkIsMobilePhone() && !isMobileDevice) {
      return;
    }

    try {
      const container = containerRef.current || document.documentElement;
      const isLandscapeNow = window.innerWidth > window.innerHeight;

      if (!isLandscapeNow) {
        // Request Fullscreen & Lock to Landscape
        if (!document.fullscreenElement && !(document as any).webkitFullscreenElement) {
          if (container.requestFullscreen) {
            await container.requestFullscreen();
          } else if ((container as any).webkitRequestFullscreen) {
            await (container as any).webkitRequestFullscreen();
          } else if (videoRef.current && (videoRef.current as any).webkitEnterFullscreen) {
            (videoRef.current as any).webkitEnterFullscreen();
          }
        }
        setIsFullscreen(true);

        if (screen.orientation && (screen.orientation as any).lock) {
          try {
            await (screen.orientation as any).lock('landscape');
          } catch { }
        }
      } else {
        // Rotate back to portrait or unlock orientation
        if (screen.orientation && (screen.orientation as any).lock) {
          try {
            await (screen.orientation as any).lock('portrait');
          } catch {
            if (screen.orientation && (screen.orientation as any).unlock) {
              (screen.orientation as any).unlock();
            }
          }
        } else if (screen.orientation && (screen.orientation as any).unlock) {
          (screen.orientation as any).unlock();
        }

        if (document.fullscreenElement || (document as any).webkitFullscreenElement) {
          if (document.exitFullscreen) {
            await document.exitFullscreen();
          } else if ((document as any).webkitExitFullscreen) {
            await (document as any).webkitExitFullscreen();
          }
        }
        setIsFullscreen(false);
      }
    } catch (err) {
      console.warn('Rotate toggle failed:', err);
    }
  };

  const handleSpeedChange = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
      setSpeedMenuOpen(false);
    }
  };

  const embedUrl = getEmbedUrl();
  const isIframeMode = (selectedServer === 'videasy' || selectedServer === 'vidsrc') && embedUrl.startsWith('http');

  const currentSeasonObj = seasonsList?.find(s => s.seasonNumber === drawerSeasonNumber) || {
    id: String(drawerSeasonNumber),
    seasonNumber: drawerSeasonNumber,
    title: `Season ${drawerSeasonNumber}`,
    episodeCount: drawerEpisodes.length || undefined,
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={showControls}
      onClick={showControls}
      className="fixed inset-0 w-full h-full h-[100dvh] bg-black overflow-hidden flex items-center justify-center select-none touch-manipulation z-50"
    >
      {/* Video Content: Responsive Iframe (Videasy.ws / Vidsrc) or HTML5 Video */}
      {isIframeMode ? (
        <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-black">
          <iframe
            src={embedUrl}
            title={title}
            width="100%"
            height="100%"
            frameBorder="0"
            allowFullScreen
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media; accelerometer; gyroscope; web-share"
            className="w-full h-full border-0 absolute inset-0"
          />
        </div>
      ) : (
        <video
          ref={videoRef}
          src={videoUrl}
          onClick={togglePlay}
          onTimeUpdate={() => videoRef.current && setCurrentTime(videoRef.current.currentTime)}
          onEnded={() => {
            setIsPlaying(false);
            stopLiveStreamRadar();
            if (hasNextEpisode && onNextEpisode) onNextEpisode();
          }}
          onError={() => setErrorState('Unable to play direct video stream. Retrying playback...')}
          className="w-full h-full object-contain cursor-pointer"
          playsInline
        />
      )}

      {/* Error Overlay if any */}
      {errorState && (
        <div className="absolute inset-0 bg-dark-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mb-4">
            <X className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Streaming Playback Notice</h3>
          <p className="text-sm text-slate-300 max-w-md mb-6">{errorState}</p>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setErrorState(null);
                setSelectedServer('videasy');
              }}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-accent-pink hover:from-brand-500 hover:to-accent-pink text-white font-semibold text-sm shadow-glow-brand"
            >
              Retry Playback
            </button>
          </div>
        </div>
      )}


      {/* Tap/Click detector to reveal controls when hidden */}
      {!controlsVisible && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            showControls();
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
            showControls();
          }}
          className={
            isIframeMode
              ? 'absolute top-0 left-0 right-0 h-28 z-10 cursor-pointer'
              : 'absolute inset-0 z-10 cursor-pointer'
          }
          title="Click to show player controls"
        />
      )}

      {/* Top Bar Controls Overlay */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          triggerControlsAutoHide();
        }}
        className={`absolute top-0 left-0 right-0 pt-[max(0.6rem,env(safe-area-inset-top))] pb-3 sm:pb-6 pl-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))] bg-gradient-to-b from-black/95 via-black/70 to-transparent z-20 flex items-center justify-between transition-opacity duration-300 ${controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
      >
        <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              stopLiveStreamRadar();
              navigate(backUrl);
            }}
            className="p-2 sm:p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 backdrop-blur-md transition-all hover:scale-105 active:scale-95 shrink-0"
            title="Back to Catalog"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base md:text-xl font-bold text-white tracking-wide drop-shadow truncate max-w-[150px] sm:max-w-xs md:max-w-md">{title}</h2>
            {subtitle && (
              (episodesList.length > 0 || seasonsList.length > 0) ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEpisodesDrawerOpen(true);
                  }}
                  className="flex items-center gap-1 text-[10px] sm:text-xs text-[#a3a3a3] hover:text-white font-medium truncate group transition-colors cursor-pointer text-left"
                  title="Choose season or episode"
                >
                  <span className="truncate">{subtitle}</span>
                  <ChevronDown className="w-3 h-3 text-[#a3a3a3] group-hover:text-white transition-transform group-hover:translate-y-0.5 shrink-0" />
                </button>
              ) : (
                <p className="text-[10px] sm:text-xs text-[#a3a3a3] font-medium truncate">{subtitle}</p>
              )
            )}
          </div>
        </div>

        {/* Right Tools: AdShield, Server Switcher & Episodes Drawer */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* AdShield Badge & Settings Dropdown */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setAdShieldMenuOpen(!adShieldMenuOpen);
                triggerControlsAutoHide();
              }}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg sm:rounded-xl text-xs font-bold backdrop-blur-md border transition-all ${shieldActive
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                : 'bg-[#202020] text-[#a3a3a3] border-white/10'
                }`}
              title="Ad & Popup Shield Settings"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">AdShield {shieldActive ? 'Active' : 'Off'}</span>
              {blockedCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 text-[10px] font-extrabold">
                  {blockedCount}
                </span>
              )}
            </button>

            {adShieldMenuOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 mt-2 w-72 rounded-2xl bg-dark-900 border border-white/10 shadow-2xl p-4 z-30 animate-scale-in"
              >
                <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-sm text-white">Ad & Popup Shield</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${!shieldActive ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                    {shieldActive ? 'Active' : 'Disabled'}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                  Interception script actively intercepts popup windows, new tab spawns, and unauthorized redirects without breaking streaming playback.
                </p>

                {/* Telemetry counter */}
                <div className="p-2.5 rounded-xl bg-dark-850 border border-white/5 mb-3 flex items-center justify-between">
                  <span className="text-xs text-slate-300 font-medium">Ads & Popups Blocked:</span>
                  <span className="font-mono text-xs font-bold text-emerald-400">{blockedCount}</span>
                </div>

                {/* Mode Selector */}
                <div className="space-y-1.5">
                  <button
                    onClick={() => {
                      setShieldActive(true);
                      setAdShieldMenuOpen(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${shieldActive
                      ? 'bg-emerald-600 text-white shadow-glow-emerald'
                      : 'text-slate-300 hover:bg-white/5'
                      }`}
                  >
                    <div>
                      <p className="font-bold">Script Protection Active</p>
                      <p className="text-[10px] text-emerald-200 font-normal">Block popups, new tabs & anti-redirects</p>
                    </div>
                    {shieldActive && <CheckCircle2 className="w-4 h-4 text-white shrink-0" />}
                  </button>

                  <button
                    onClick={() => {
                      setShieldActive(false);
                      setAdShieldMenuOpen(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${!shieldActive
                      ? 'bg-rose-600 text-white'
                      : 'text-slate-400 hover:bg-white/5'
                      }`}
                  >
                    <div>
                      <p className="font-bold">Disable Shield</p>
                      <p className="text-[10px] text-slate-400 font-normal">Allow all popup behaviors</p>
                    </div>
                    {!shieldActive && <CheckCircle2 className="w-4 h-4 text-white shrink-0" />}
                  </button>
                </div>
              </div>
            )}
          </div>



          {/* Drawer button for Episodes & Seasons list */}
          {(episodesList.length > 0 || seasonsList.length > 0) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEpisodesDrawerOpen(true);
              }}
              className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg sm:rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md border border-white/10 transition-all hover:scale-105 active:scale-95"
            >
              <List className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{seasonsList.length > 1 ? 'Seasons' : 'Episodes'}</span>
              {episodesList.length > 0 && <span className="hidden xs:inline">({episodesList.length})</span>}
            </button>
          )}

          {/* Rotate Button (Mobile Only - icon only using rotate.png) */}
          {isMobileDevice && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRotate();
                triggerControlsAutoHide();
              }}
              className="p-2 sm:p-2.5 rounded-full bg-black/60 hover:bg-black/90 active:bg-white/20 text-white border border-white/20 backdrop-blur-md transition-all hover:scale-105 active:scale-95 shrink-0 flex items-center justify-center shadow-md"
              title={isLandscape ? 'Rotate to Portrait' : 'Rotate to Landscape'}
              aria-label="Rotate screen orientation"
            >
              <img
                src={rotateIcon}
                alt="Rotate"
                className={`w-4 h-4 sm:w-5 sm:h-5 object-contain brightness-0 invert select-none pointer-events-none transition-transform duration-300 ${
                  isLandscape ? 'rotate-90' : ''
                }`}
              />
            </button>
          )}
        </div>
      </div>

      {/* Bottom Bar Controls for Direct Player */}
      {!isIframeMode && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            triggerControlsAutoHide();
          }}
          className={`absolute bottom-0 left-0 right-0 px-6 pb-6 pt-16 bg-gradient-to-t from-dark-950/95 via-dark-950/60 to-transparent z-20 flex flex-col gap-3 transition-opacity duration-300 ${controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
        >
          {/* Seek timeline */}
          <div className="flex items-center gap-3 w-full">
            <span className="text-xs font-semibold text-slate-300 min-w-[45px]">
              {formatSeconds(currentTime)}
            </span>
            <div className="relative flex-1 group/track flex items-center">
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer focus:outline-none accent-brand-500 hover:h-2.5 transition-all"
              />
            </div>
            <span className="text-xs font-semibold text-slate-400 min-w-[45px]">
              {formatSeconds(duration)}
            </span>
          </div>

          {/* Action Controls Row */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-4">
              <button
                onClick={togglePlay}
                className="w-11 h-11 rounded-full bg-gradient-to-r from-brand-600 to-accent-pink hover:from-brand-500 hover:to-accent-pink text-white flex items-center justify-center shadow-glow-brand transition-all hover:scale-110 active:scale-95"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
              </button>

              <button onClick={() => skip(-10)} className="p-2 text-slate-300 hover:text-white transition-colors" title="Rewind 10 seconds">
                <RotateCcw className="w-5 h-5" />
              </button>

              <button onClick={() => skip(10)} className="p-2 text-slate-300 hover:text-white transition-colors" title="Forward 10 seconds">
                <RotateCw className="w-5 h-5" />
              </button>

              {hasNextEpisode && onNextEpisode && (
                <button onClick={onNextEpisode} className="p-2 text-slate-300 hover:text-white transition-colors" title="Next Episode">
                  <SkipForward className="w-5 h-5" />
                </button>
              )}

              {(episodesList.length > 0 || seasonsList.length > 0) && (
                <button
                  onClick={() => setEpisodesDrawerOpen(true)}
                  className="p-2 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
                  title="Episodes & Seasons"
                >
                  <List className="w-5 h-5" />
                  <span className="hidden md:inline text-xs font-semibold">Episodes</span>
                </button>
              )}

              <div className="flex items-center gap-2 group/volume ml-2">
                <button onClick={toggleMute} className="p-2 text-slate-300 hover:text-white transition-colors">
                  {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer focus:outline-none accent-brand-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  onClick={() => setSpeedMenuOpen(!speedMenuOpen)}
                  className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-200 transition-colors"
                >
                  {playbackSpeed}x
                </button>
                {speedMenuOpen && (
                  <div className="absolute bottom-full right-0 mb-2 w-28 rounded-xl bg-dark-900 border border-white/10 shadow-2xl p-1 z-30 animate-scale-in">
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
                      <button
                        key={s}
                        onClick={() => handleSpeedChange(s)}
                        className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors font-medium ${playbackSpeed === s ? 'bg-brand-600 text-white font-bold' : 'text-slate-300 hover:bg-white/10'
                          }`}
                      >
                        {s}x {s === 1 && '(Normal)'}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button onClick={toggleFullscreen} className="p-2 text-slate-300 hover:text-white transition-colors" title="Fullscreen">
                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Episodes & Seasons Sidebar Drawer (Netflix Style) */}
      {episodesDrawerOpen && (
        <>
          <div onClick={() => setEpisodesDrawerOpen(false)} className="fixed inset-0 bg-black/75 backdrop-blur-sm z-40 transition-opacity" />
          <div className="fixed top-0 bottom-0 right-0 w-full sm:w-[480px] md:w-[520px] max-w-full bg-[#141414] border-l border-[#2e2e2e] z-50 p-4 sm:p-6 pr-[max(1.25rem,env(safe-area-inset-right))] pl-[max(1.25rem,env(safe-area-inset-left))] flex flex-col shadow-2xl animate-slide-left">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div className="min-w-0 pr-2">
                <h3 className="font-black text-xl sm:text-2xl text-white tracking-tight">Episodes</h3>
                <p className="text-xs text-[#a3a3a3] font-medium mt-0.5 truncate">{title}</p>
              </div>
              <button
                onClick={() => setEpisodesDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 shrink-0"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Netflix Custom Season Dropdown */}
            {seasonsList && seasonsList.length > 0 && (
              <div ref={seasonDropdownRef} className="mb-4 relative z-30">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSeasonDropdownOpen(!seasonDropdownOpen);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg bg-[#242424] hover:bg-[#2c2c2c] active:bg-[#333333] text-white font-bold text-sm sm:text-base border transition-all shadow-md group ${
                    seasonDropdownOpen ? 'border-white ring-1 ring-white/50 bg-[#2c2c2c]' : 'border-white/20 hover:border-white/40'
                  }`}
                  title="Select Season"
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-1">
                    <span className="truncate text-white font-bold text-sm sm:text-base">
                      {currentSeasonObj?.title || `Season ${drawerSeasonNumber}`}
                    </span>
                    {currentSeasonObj?.episodeCount ? (
                      <span className="text-xs text-[#a3a3a3] font-semibold bg-black/50 px-2 py-0.5 rounded shrink-0">
                        {currentSeasonObj.episodeCount} Episodes
                      </span>
                    ) : null}
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-white/80 shrink-0 transition-transform duration-200 group-hover:text-white ${
                      seasonDropdownOpen ? 'rotate-180 text-white' : ''
                    }`}
                  />
                </button>

                {/* Season Dropdown Panel */}
                {seasonDropdownOpen && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute top-full left-0 right-0 mt-1.5 bg-[#1e1e1e] border border-white/20 rounded-xl shadow-2xl py-1.5 z-50 max-h-64 overflow-y-auto custom-scrollbar animate-scale-in"
                  >
                    <div className="px-3.5 py-1.5 text-[10px] uppercase font-bold text-[#808080] tracking-wider border-b border-white/5 mb-1">
                      Select Season
                    </div>
                    {seasonsList.map((sea) => {
                      const isSelected = sea.seasonNumber === drawerSeasonNumber;
                      return (
                        <button
                          key={sea.id || sea.seasonNumber}
                          type="button"
                          onClick={() => handleDrawerSeasonChange(sea.seasonNumber)}
                          className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left text-xs sm:text-sm font-semibold transition-colors ${
                            isSelected
                              ? 'bg-[#292929] text-white font-extrabold border-l-4 border-l-[#E50914]'
                              : 'text-[#d2d2d2] hover:bg-[#262626] hover:text-white border-l-4 border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="truncate">{sea.title || `Season ${sea.seasonNumber}`}</span>
                            {sea.episodeCount ? (
                              <span className="text-xs text-[#8c8c8c] font-normal shrink-0">
                                ({sea.episodeCount} episodes)
                              </span>
                            ) : null}
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-[#E50914] shrink-0 ml-2" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Episodes List in Drawer */}
            <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1 divide-y divide-white/5">
              {drawerLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#a3a3a3]">
                  <div className="w-8 h-8 border-3 border-[#E50914] border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-semibold tracking-wide">Loading episodes...</p>
                </div>
              ) : drawerEpisodes.length === 0 ? (
                <div className="text-center py-16 text-[#a3a3a3] text-sm">
                  No episodes found for this season.
                </div>
              ) : (
                drawerEpisodes.map((ep) => {
                  const isCurrent = drawerSeasonNumber === seasonNumber && ep.episodeNumber === episodeNumber;
                  return (
                    <div
                      key={ep.id}
                      onClick={() => {
                        if (onSelectEpisode) {
                          onSelectEpisode(ep.id, drawerSeasonNumber, ep.episodeNumber);
                        }
                        setEpisodesDrawerOpen(false);
                      }}
                      className={`pt-3 pb-3 px-2 sm:px-3 rounded-lg transition-colors cursor-pointer flex gap-3 sm:gap-4 items-start group ${
                        isCurrent
                          ? 'bg-[#222222] border-l-4 border-l-[#E50914] pl-2 sm:pl-2.5 shadow-md'
                          : 'hover:bg-[#1c1c1c]'
                      }`}
                    >
                      {/* Episode Number Index (Netflix Style) */}
                      <span className={`text-sm sm:text-base font-bold shrink-0 w-5 text-center mt-3 ${
                        isCurrent ? 'text-white' : 'text-[#737373] group-hover:text-white transition-colors'
                      }`}>
                        {ep.episodeNumber}
                      </span>

                      {/* Episode Thumbnail */}
                      <div className="relative w-28 sm:w-32 aspect-video rounded-md overflow-hidden shrink-0 bg-[#242424] shadow-sm">
                        <img
                          src={ep.thumbnailUrl || posterUrl || backdropUrl}
                          alt={ep.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        {/* Play hover overlay / playing state */}
                        <div className={`absolute inset-0 flex items-center justify-center transition-opacity ${
                          isCurrent ? 'bg-black/50 opacity-100' : 'bg-black/30 opacity-0 group-hover:opacity-100'
                        }`}>
                          <Play className={`w-5 h-5 ${isCurrent ? 'fill-[#E50914] text-[#E50914]' : 'fill-white text-white'}`} />
                        </div>
                        {isCurrent && (
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#E50914]" />
                        )}
                      </div>

                      {/* Episode Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className={`text-xs sm:text-sm font-bold truncate transition-colors ${
                            isCurrent ? 'text-white font-extrabold' : 'text-white/90 group-hover:text-white'
                          }`}>
                            {ep.title}
                          </h4>
                          {ep.duration ? (
                            <span className="text-[11px] sm:text-xs text-[#808080] font-semibold shrink-0">
                              {ep.duration}m
                            </span>
                          ) : null}
                        </div>
                        {ep.description ? (
                          <p className="text-[11px] sm:text-xs text-[#a3a3a3] line-clamp-2 leading-relaxed mt-1 font-normal">
                            {ep.description}
                          </p>
                        ) : (
                          <p className="text-[11px] text-[#737373] mt-1 italic">
                            Episode {ep.episodeNumber}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
