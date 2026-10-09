import { ENV } from '../config/env';
import { movieService } from './movieService';
import { seriesService } from './seriesService';
import { episodeService } from './episodeService';
import { genreService } from './genreService';
import { slugify } from '../utils/slugify';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_W500 = 'https://image.tmdb.org/t/p/w500';
const IMAGE_BASE_ORIGINAL = 'https://image.tmdb.org/t/p/original';

export class TmdbService {
  private async fetchTmdb<T = any>(endpoint: string, params: Record<string, string | number> = {}): Promise<T> {
    const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        url.searchParams.append(k, String(v));
      }
    });

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${ENV.TMDB_READ_ACCESS_TOKEN}`,
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`TMDB API Error (${res.status}): ${errText}`);
    }

    return (await res.json()) as T;
  }

  // --- Discovery & Feeds ---

  async getTrendingMovies(timeWindow: 'day' | 'week' = 'week') {
    const data = await this.fetchTmdb(`/trending/movie/${timeWindow}`);
    return (data.results || []).map((m: any) => this.mapTmdbMovieSummary(m));
  }

  async getTrendingSeries(timeWindow: 'day' | 'week' = 'week') {
    const data = await this.fetchTmdb(`/trending/tv/${timeWindow}`);
    return (data.results || []).map((s: any) => this.mapTmdbSeriesSummary(s));
  }

  async getPopularMovies(page: number = 1) {
    const data = await this.fetchTmdb('/movie/popular', { page });
    return {
      results: (data.results || []).map((m: any) => this.mapTmdbMovieSummary(m)),
      page: data.page,
      totalPages: Math.min(data.total_pages || 1, 500),
      totalResults: data.total_results,
    };
  }

  async getPopularSeries(page: number = 1) {
    const data = await this.fetchTmdb('/tv/popular', { page });
    return {
      results: (data.results || []).map((s: any) => this.mapTmdbSeriesSummary(s)),
      page: data.page,
      totalPages: Math.min(data.total_pages || 1, 500),
      totalResults: data.total_results,
    };
  }

  async getTopRatedMovies(page: number = 1) {
    const data = await this.fetchTmdb('/movie/top_rated', { page });
    return {
      results: (data.results || []).map((m: any) => this.mapTmdbMovieSummary(m)),
      page: data.page,
      totalPages: Math.min(data.total_pages || 1, 500),
      totalResults: data.total_results,
    };
  }

  async getTopRatedSeries(page: number = 1) {
    const data = await this.fetchTmdb('/tv/top_rated', { page });
    return {
      results: (data.results || []).map((s: any) => this.mapTmdbSeriesSummary(s)),
      page: data.page,
      totalPages: Math.min(data.total_pages || 1, 500),
      totalResults: data.total_results,
    };
  }

  async getMovieGenres() {
    const data = await this.fetchTmdb('/genre/movie/list');
    return data.genres || [];
  }

  async getSeriesGenres() {
    const data = await this.fetchTmdb('/genre/tv/list');
    return data.genres || [];
  }

  async discoverMovies(params: { genreId?: string | number; year?: number; sortBy?: string; page?: number }) {
    const { genreId, year, sortBy = 'popularity.desc', page = 1 } = params;
    const queryParams: Record<string, string | number> = {
      page,
      sort_by: sortBy,
      include_adult: 'false',
      'vote_count.gte': 50,
    };
    if (genreId) queryParams.with_genres = genreId;
    if (year) queryParams.primary_release_year = year;

    const data = await this.fetchTmdb('/discover/movie', queryParams);
    return {
      results: (data.results || []).map((m: any) => this.mapTmdbMovieSummary(m)),
      page: data.page,
      totalPages: Math.min(data.total_pages || 1, 500),
      totalResults: data.total_results,
    };
  }

  async discoverSeries(params: { genreId?: string | number; year?: number; sortBy?: string; page?: number }) {
    const { genreId, year, sortBy = 'popularity.desc', page = 1 } = params;
    const queryParams: Record<string, string | number> = {
      page,
      sort_by: sortBy,
      include_adult: 'false',
      'vote_count.gte': 30,
    };
    if (genreId) queryParams.with_genres = genreId;
    if (year) queryParams.first_air_date_year = year;

    const data = await this.fetchTmdb('/discover/tv', queryParams);
    return {
      results: (data.results || []).map((s: any) => this.mapTmdbSeriesSummary(s)),
      page: data.page,
      totalPages: Math.min(data.total_pages || 1, 500),
      totalResults: data.total_results,
    };
  }

  async search(query: string, type: 'movie' | 'tv' | 'multi' = 'multi', page: number = 1) {
    const data = await this.fetchTmdb(`/search/${type}`, { query, page, include_adult: 'false' });
    return {
      results: (data.results || [])
        .filter((item: any) => item.poster_path || item.backdrop_path)
        .map((item: any) => {
          if (item.media_type === 'tv' || type === 'tv') {
            return this.mapTmdbSeriesSummary(item);
          }
          return this.mapTmdbMovieSummary(item);
        }),
      page: data.page,
      totalPages: Math.min(data.total_pages || 1, 500),
      totalResults: data.total_results,
    };
  }

  async getFeatured() {
    const trending = await this.getTrendingMovies('day');
    return trending.filter((m: any) => m.backdropUrl).slice(0, 5);
  }

  // --- Full Details & Credits ---

  async getMovieDetails(tmdbId: number | string) {
    const [details, videos, releaseDates, credits, similar] = await Promise.all([
      this.fetchTmdb(`/movie/${tmdbId}`),
      this.fetchTmdb(`/movie/${tmdbId}/videos`).catch(() => ({ results: [] })),
      this.fetchTmdb(`/movie/${tmdbId}/release_dates`).catch(() => ({ results: [] })),
      this.fetchTmdb(`/movie/${tmdbId}/credits`).catch(() => ({ cast: [], crew: [] })),
      this.fetchTmdb(`/movie/${tmdbId}/recommendations`).catch(() => ({ results: [] })),
    ]);

    // Find YouTube trailer
    const trailer = (videos.results || []).find(
      (v: any) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
    );
    const trailerUrl = trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : '';

    // Find US certification (rating)
    let rating = 'PG-13';
    const usReleases = (releaseDates.results || []).find((r: any) => r.iso_3166_1 === 'US');
    if (usReleases && usReleases.release_dates && usReleases.release_dates.length > 0) {
      const cert = usReleases.release_dates.find((d: any) => d.certification);
      if (cert && cert.certification) rating = cert.certification;
    }

    const releaseYear = details.release_date ? parseInt(details.release_date.split('-')[0], 10) : new Date().getFullYear();

    const cast = (credits.cast || []).slice(0, 8).map((c: any) => ({
      id: c.id,
      name: c.name,
      character: c.character,
      profileUrl: c.profile_path ? `${IMAGE_BASE_W500}${c.profile_path}` : null,
    }));

    const director = (credits.crew || []).find((cr: any) => cr.job === 'Director')?.name || 'Unknown';

    return {
      id: String(details.id),
      tmdbId: details.id,
      imdbId: details.imdb_id,
      title: details.title,
      slug: slugify(details.title || `movie-${details.id}`),
      description: details.overview || 'No synopsis available.',
      posterUrl: details.poster_path ? `${IMAGE_BASE_W500}${details.poster_path}` : '',
      backdropUrl: details.backdrop_path ? `${IMAGE_BASE_ORIGINAL}${details.backdrop_path}` : '',
      trailerUrl,
      videoUrl: `https://player.videasy.ws/embed/movie/${details.id}`,
      releaseYear,
      duration: details.runtime || 110,
      rating,
      voteAverage: details.vote_average ? Number(details.vote_average.toFixed(1)) : 8.0,
      voteCount: details.vote_count,
      language: details.spoken_languages?.[0]?.english_name || 'English',
      country: details.production_countries?.[0]?.name || 'United States',
      genres: (details.genres || []).map((g: any) => ({ id: String(g.id), name: g.name, slug: slugify(g.name) })),
      director,
      cast,
      similar: (similar.results || []).slice(0, 10).map((m: any) => this.mapTmdbMovieSummary(m)),
    };
  }

  async getSeriesDetails(tmdbId: number | string) {
    const [details, videos, credits, similar] = await Promise.all([
      this.fetchTmdb(`/tv/${tmdbId}`),
      this.fetchTmdb(`/tv/${tmdbId}/videos`).catch(() => ({ results: [] })),
      this.fetchTmdb(`/tv/${tmdbId}/credits`).catch(() => ({ cast: [], crew: [] })),
      this.fetchTmdb(`/tv/${tmdbId}/recommendations`).catch(() => ({ results: [] })),
    ]);

    const trailer = (videos.results || []).find(
      (v: any) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
    );
    const trailerUrl = trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : '';
    const releaseYear = details.first_air_date ? parseInt(details.first_air_date.split('-')[0], 10) : new Date().getFullYear();

    const seasons = (details.seasons || [])
      .filter((s: any) => s.season_number > 0)
      .map((s: any) => ({
        id: String(s.id),
        seasonNumber: s.season_number,
        title: s.name || `Season ${s.season_number}`,
        episodeCount: s.episode_count,
        posterUrl: s.poster_path ? `${IMAGE_BASE_W500}${s.poster_path}` : null,
        airDate: s.air_date,
      }));

    const cast = (credits.cast || []).slice(0, 8).map((c: any) => ({
      id: c.id,
      name: c.name,
      character: c.character,
      profileUrl: c.profile_path ? `${IMAGE_BASE_W500}${c.profile_path}` : null,
    }));

    return {
      id: String(details.id),
      tmdbId: details.id,
      title: details.name,
      slug: slugify(details.name || `series-${details.id}`),
      description: details.overview || 'No synopsis available.',
      posterUrl: details.poster_path ? `${IMAGE_BASE_W500}${details.poster_path}` : '',
      backdropUrl: details.backdrop_path ? `${IMAGE_BASE_ORIGINAL}${details.backdrop_path}` : '',
      trailerUrl,
      releaseYear,
      rating: 'TV-MA',
      voteAverage: details.vote_average ? Number(details.vote_average.toFixed(1)) : 8.0,
      voteCount: details.vote_count,
      language: details.spoken_languages?.[0]?.english_name || 'English',
      country: details.origin_country?.[0] || 'United States',
      genres: (details.genres || []).map((g: any) => ({ id: String(g.id), name: g.name, slug: slugify(g.name) })),
      numberOfSeasons: details.number_of_seasons || seasons.length,
      numberOfEpisodes: details.number_of_episodes,
      seasons,
      cast,
      similar: (similar.results || []).slice(0, 10).map((s: any) => this.mapTmdbSeriesSummary(s)),
    };
  }

  async getSeasonEpisodes(tmdbId: number | string, seasonNumber: number | string) {
    const season = await this.fetchTmdb(`/tv/${tmdbId}/season/${seasonNumber}`);
    const showDetails = await this.fetchTmdb(`/tv/${tmdbId}`).catch(() => ({ name: 'TV Series', backdrop_path: null }));

    return (season.episodes || []).map((ep: any) => ({
      id: `tv-${tmdbId}-s${seasonNumber}-e${ep.episode_number}`,
      tmdbId: ep.id,
      seriesTmdbId: tmdbId,
      seriesTitle: showDetails.name || 'TV Series',
      seasonNumber: parseInt(String(seasonNumber), 10),
      episodeNumber: ep.episode_number,
      title: ep.name || `Episode ${ep.episode_number}`,
      description: ep.overview || 'No episode description available.',
      duration: ep.runtime || 45,
      thumbnailUrl: ep.still_path
        ? `${IMAGE_BASE_W500}${ep.still_path}`
        : (showDetails.backdrop_path ? `${IMAGE_BASE_W500}${showDetails.backdrop_path}` : ''),
      videoUrl: `https://player.videasy.ws/embed/tv/${tmdbId}/${seasonNumber}/${ep.episode_number}`,
      releaseDate: ep.air_date,
      voteAverage: ep.vote_average ? Number(ep.vote_average.toFixed(1)) : 8.0,
    }));
  }

  // --- Seed / Import Helpers for Custom Database if ever needed ---

  async importMovie(tmdbId: number | string) {
    const movieData = await this.getMovieDetails(tmdbId);
    const genreIds: string[] = [];
    const allDbGenres = await genreService.getGenres();

    for (const g of movieData.genres) {
      let existing = allDbGenres.find((dbG) => dbG.slug === g.slug || dbG.name.toLowerCase() === g.name.toLowerCase());
      if (!existing) {
        existing = await genreService.createGenre(g.name, g.slug);
      }
      if (existing) genreIds.push(existing.id);
    }

    const existingMovie = await movieService.getMovieBySlug(movieData.slug);
    if (existingMovie) {
      return await movieService.updateMovie(existingMovie.id, {
        title: movieData.title,
        description: movieData.description,
        posterUrl: movieData.posterUrl,
        backdropUrl: movieData.backdropUrl,
        trailerUrl: movieData.trailerUrl,
        videoUrl: movieData.videoUrl,
        releaseYear: movieData.releaseYear,
        duration: movieData.duration,
        rating: movieData.rating,
        language: movieData.language,
        country: movieData.country,
        isPublished: true,
        genreIds,
      });
    }

    return await movieService.createMovie({
      title: movieData.title,
      slug: movieData.slug,
      description: movieData.description,
      posterUrl: movieData.posterUrl,
      backdropUrl: movieData.backdropUrl,
      trailerUrl: movieData.trailerUrl,
      videoUrl: movieData.videoUrl,
      releaseYear: movieData.releaseYear,
      duration: movieData.duration,
      rating: movieData.rating,
      language: movieData.language,
      country: movieData.country,
      isFeatured: true,
      isPublished: true,
      genreIds,
    });
  }

  async importSeries(tmdbId: number | string) {
    const seriesData = await this.getSeriesDetails(tmdbId);
    const genreIds: string[] = [];
    const allDbGenres = await genreService.getGenres();

    for (const g of seriesData.genres) {
      let existing = allDbGenres.find((dbG) => dbG.slug === g.slug || dbG.name.toLowerCase() === g.name.toLowerCase());
      if (!existing) {
        existing = await genreService.createGenre(g.name, g.slug);
      }
      if (existing) genreIds.push(existing.id);
    }

    let series = await seriesService.getSeriesBySlug(seriesData.slug);
    if (!series) {
      series = await seriesService.createSeries({
        title: seriesData.title,
        slug: seriesData.slug,
        description: seriesData.description,
        posterUrl: seriesData.posterUrl,
        backdropUrl: seriesData.backdropUrl,
        trailerUrl: seriesData.trailerUrl,
        releaseYear: seriesData.releaseYear,
        rating: seriesData.rating,
        language: seriesData.language,
        country: seriesData.country,
        isFeatured: true,
        isPublished: true,
        genreIds,
      });
    }

    return await seriesService.getSeriesById(series.id);
  }

  async seedTrendingPopular() {
    const trendingMovies = await this.getTrendingMovies();
    let importedCount = 0;
    for (const m of trendingMovies.slice(0, 6)) {
      try {
        await this.importMovie(m.tmdbId);
        importedCount++;
      } catch (err) {
        console.warn(`Failed to import movie ${m.title}:`, err);
      }
    }
    return { importedCount };
  }

  private mapTmdbMovieSummary(m: any) {
    return {
      id: String(m.id),
      tmdbId: m.id,
      mediaType: 'movie' as const,
      title: m.title || m.original_title || 'Untitled',
      slug: slugify(m.title || `movie-${m.id}`),
      description: m.overview || '',
      posterUrl: m.poster_path ? `${IMAGE_BASE_W500}${m.poster_path}` : '',
      backdropUrl: m.backdrop_path ? `${IMAGE_BASE_ORIGINAL}${m.backdrop_path}` : '',
      releaseYear: m.release_date ? parseInt(m.release_date.split('-')[0], 10) : 2025,
      rating: m.vote_average ? `${m.vote_average.toFixed(1)}/10` : 'PG-13',
      voteAverage: m.vote_average ? Number(m.vote_average.toFixed(1)) : 8.0,
      voteCount: m.vote_count || 0,
      videoUrl: `https://player.videasy.ws/embed/movie/${m.id}`,
    };
  }

  private mapTmdbSeriesSummary(s: any) {
    return {
      id: String(s.id),
      tmdbId: s.id,
      mediaType: 'tv' as const,
      title: s.name || s.original_name || 'Untitled',
      slug: slugify(s.name || `series-${s.id}`),
      description: s.overview || '',
      posterUrl: s.poster_path ? `${IMAGE_BASE_W500}${s.poster_path}` : '',
      backdropUrl: s.backdrop_path ? `${IMAGE_BASE_ORIGINAL}${s.backdrop_path}` : '',
      releaseYear: s.first_air_date ? parseInt(s.first_air_date.split('-')[0], 10) : 2025,
      rating: s.vote_average ? `${s.vote_average.toFixed(1)}/10` : 'TV-MA',
      voteAverage: s.vote_average ? Number(s.vote_average.toFixed(1)) : 8.0,
      voteCount: s.vote_count || 0,
      videoUrl: `https://player.videasy.ws/embed/tv/${s.id}/1/1`,
    };
  }
}

export const tmdbService = new TmdbService();
