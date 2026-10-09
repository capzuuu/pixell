import { movieService } from './movieService';
import { seriesService } from './seriesService';
import { Movie, Series } from '../models/types';

export interface SearchResults {
  query: string;
  movies: Movie[];
  series: Series[];
  totalResults: number;
}

export class SearchService {
  async searchAll(query: string, genre?: string): Promise<SearchResults> {
    const cleanQuery = (query || '').trim();

    const [movieRes, seriesRes] = await Promise.all([
      movieService.getMovies({ search: cleanQuery, genre, isPublished: true, limit: 30 }),
      seriesService.getSeriesList({ search: cleanQuery, genre, isPublished: true, limit: 30 })
    ]);

    return {
      query: cleanQuery,
      movies: movieRes.movies,
      series: seriesRes.series,
      totalResults: movieRes.movies.length + seriesRes.series.length
    };
  }
}

export const searchService = new SearchService();
