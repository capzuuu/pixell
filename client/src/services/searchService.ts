import { api } from './api';
import { SearchResults } from '../types';

export const searchService = {
  search: async (query: string, genre?: string): Promise<{ success: boolean; data: SearchResults }> => {
    return api.get('/search', { q: query, genre });
  }
};
