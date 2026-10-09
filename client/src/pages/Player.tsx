import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tmdbService } from '../services/tmdbService';
import { movieService } from '../services/movieService';
import { episodeService } from '../services/episodeService';
import { progressService } from '../services/progressService';
import { VideoPlayer } from '../components/VideoPlayer';
import { Movie, Episode, Season } from '../types';

export const Player: React.FC = () => {
  const { type, id, tmdbId, season, episode: epParam } = useParams<{
    type?: string;
    id?: string;
    tmdbId?: string;
    season?: string;
    episode?: string;
  }>();
  const navigate = useNavigate();

  const isTvRoute = Boolean(tmdbId && season && epParam) || type === 'tv';
  const resolvedTmdbId = tmdbId || (type === 'movie' || type === 'tv' ? id : undefined);
  const seasonNumber = season ? parseInt(season, 10) : 1;
  const episodeNumber = epParam ? parseInt(epParam, 10) : 1;

  const [title, setTitle] = useState<string>('Streaming Title');
  const [subtitle, setSubtitle] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [posterUrl, setPosterUrl] = useState<string>('');
  const [backdropUrl, setBackdropUrl] = useState<string>('');
  const [seasonEpisodes, setSeasonEpisodes] = useState<Episode[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [initialProgress, setInitialProgress] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [hasNext, setHasNext] = useState<boolean>(false);

  useEffect(() => {
    async function loadStream() {
      try {
        setLoading(true);

        if (isTvRoute && resolvedTmdbId) {
          // TV Series stream directly from TMDB
          const streamUrl = `https://player.videasy.ws/embed/tv/${resolvedTmdbId}/${seasonNumber}/${episodeNumber}`;
          setVideoUrl(streamUrl);

          const [seriesRes, epsRes, progRes] = await Promise.all([
            tmdbService.getSeriesDetails(resolvedTmdbId).catch(() => ({ success: false, data: null })),
            tmdbService.getSeasonEpisodes(resolvedTmdbId, seasonNumber).catch(() => ({ success: false, data: [] })),
            progressService.getItemProgress({ tmdbId: resolvedTmdbId, seasonNumber, episodeNumber }).catch(() => ({ success: false, data: null })),
          ]);

          if (seriesRes.success && seriesRes.data) {
            setTitle(seriesRes.data.title);
            setPosterUrl(seriesRes.data.posterUrl);
            setBackdropUrl(seriesRes.data.backdropUrl);

            const rawSeasons = (seriesRes.data.seasons || [])
              .filter((s: Season) => s.seasonNumber > 0)
              .sort((a: Season, b: Season) => a.seasonNumber - b.seasonNumber);

            if (rawSeasons.length > 0) {
              setSeasons(rawSeasons);
            } else if (seriesRes.data.numberOfSeasons) {
              setSeasons(
                Array.from({ length: seriesRes.data.numberOfSeasons }, (_, i) => ({
                  id: String(i + 1),
                  seasonNumber: i + 1,
                  title: `Season ${i + 1}`,
                  episodeCount: 10,
                }))
              );
            }
          }

          if (epsRes.success && epsRes.data) {
            setSeasonEpisodes(epsRes.data);
            const currentEp = epsRes.data.find(e => e.episodeNumber === episodeNumber);
            if (currentEp) {
              setSubtitle(`S${seasonNumber}:E${episodeNumber} • ${currentEp.title}`);
            } else {
              setSubtitle(`Season ${seasonNumber} • Episode ${episodeNumber}`);
            }

            const nextEpExists = epsRes.data.some(e => e.episodeNumber === episodeNumber + 1);
            setHasNext(nextEpExists);
          } else {
            setSubtitle(`Season ${seasonNumber} • Episode ${episodeNumber}`);
          }

          if (progRes.data && progRes.data.progressSeconds > 0) {
            setInitialProgress(progRes.data.progressSeconds);
          }
        } else if (type === 'movie' && resolvedTmdbId) {
          // Movie stream directly from TMDB
          const streamUrl = `https://player.videasy.ws/embed/movie/${resolvedTmdbId}`;
          setVideoUrl(streamUrl);

          const [movieRes, progRes] = await Promise.all([
            /^\d+$/.test(resolvedTmdbId)
              ? tmdbService.getMovieDetails(resolvedTmdbId).catch(() => ({ success: false, data: null }))
              : movieService.getMovieBySlugOrId(resolvedTmdbId).catch(() => ({ success: false, data: null })),
            progressService.getItemProgress({ tmdbId: resolvedTmdbId, movieId: resolvedTmdbId }).catch(() => ({ success: false, data: null })),
          ]);

          if (movieRes.success && movieRes.data) {
            setTitle(movieRes.data.title);
            setSubtitle(`${movieRes.data.releaseYear} • ${movieRes.data.rating || 'PG-13'}`);
            setPosterUrl(movieRes.data.posterUrl);
            setBackdropUrl(movieRes.data.backdropUrl);
          }

          if (progRes.data && progRes.data.progressSeconds > 0) {
            setInitialProgress(progRes.data.progressSeconds);
          }
        } else if (type === 'episode' && id) {
          // Legacy episode route
          const [epRes, progRes] = await Promise.all([
            episodeService.getEpisodeById(id).catch(() => ({ success: false, data: null })),
            progressService.getItemProgress({ episodeId: id }).catch(() => ({ success: false, data: null })),
          ]);

          if (epRes.success && epRes.data) {
            const ep = epRes.data;
            setTitle(ep.seriesTitle || 'TV Series');
            setSubtitle(`S${ep.seasonNumber || 1}:E${ep.episodeNumber} • ${ep.title}`);
            setVideoUrl(ep.videoUrl || `https://player.videasy.ws/embed/tv/${ep.seriesTmdbId || ep.seriesId || '1399'}/${ep.seasonNumber || 1}/${ep.episodeNumber}`);
            setPosterUrl(ep.thumbnailUrl);

            if (ep.seasonId) {
              const seaRes = await episodeService.getEpisodesBySeason(ep.seasonId);
              if (seaRes.success && seaRes.data) {
                setSeasonEpisodes(seaRes.data);
                setHasNext(seaRes.data.some(e => e.episodeNumber === ep.episodeNumber + 1));
              }
            }
          }

          if (progRes.data && progRes.data.progressSeconds > 0) {
            setInitialProgress(progRes.data.progressSeconds);
          }
        }
      } catch (err) {
        console.error('Error loading stream player:', err);
      } finally {
        setLoading(false);
      }
    }

    loadStream();
  }, [type, id, tmdbId, season, epParam, isTvRoute, resolvedTmdbId, seasonNumber, episodeNumber]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#E50914] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold tracking-wide text-[#a3a3a3]">Loading high definition stream...</p>
        </div>
      </div>
    );
  }

  const handleNextEpisode = () => {
    if (isTvRoute && resolvedTmdbId) {
      navigate(`/watch/tv/${resolvedTmdbId}/${seasonNumber}/${episodeNumber + 1}`);
    }
  };

  const handleSelectEpisode = (selectedEpId: string, targetSeasonNum?: number, targetEpNum?: number) => {
    const sNum = targetSeasonNum ?? seasonNumber;
    if (resolvedTmdbId) {
      const epNum = targetEpNum ?? seasonEpisodes.find(e => e.id === selectedEpId)?.episodeNumber ?? 1;
      navigate(`/watch/tv/${resolvedTmdbId}/${sNum}/${epNum}`);
    } else {
      navigate(`/watch/episode/${selectedEpId}`);
    }
  };

  const handleSelectSeason = (selectedSeasonNum: number) => {
    if (resolvedTmdbId) {
      navigate(`/watch/tv/${resolvedTmdbId}/${selectedSeasonNum}/1`);
    }
  };

  const backUrl = isTvRoute && resolvedTmdbId
    ? `/series/${resolvedTmdbId}`
    : type === 'movie' && resolvedTmdbId
    ? `/movie/${resolvedTmdbId}`
    : '/';

  return (
    <VideoPlayer
      videoUrl={videoUrl}
      title={title}
      subtitle={subtitle}
      posterUrl={posterUrl}
      backdropUrl={backdropUrl}
      tmdbId={resolvedTmdbId}
      movieId={type === 'movie' ? resolvedTmdbId : undefined}
      episodeId={type === 'episode' ? id : undefined}
      seasonNumber={seasonNumber}
      episodeNumber={episodeNumber}
      initialProgressSeconds={initialProgress}
      hasNextEpisode={hasNext}
      onNextEpisode={handleNextEpisode}
      episodesList={seasonEpisodes}
      seasonsList={seasons}
      onSelectEpisode={handleSelectEpisode}
      onSelectSeason={handleSelectSeason}
      backUrl={backUrl}
    />
  );
};
