import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Watchlist } from '../types';
import { watchlistService, AddWatchlistPayload } from '../services/watchlistService';
import { useToast } from './ToastContext';

interface WatchlistContextType {
  watchlist: Watchlist[];
  loading: boolean;
  isSaved: (targetId: string) => boolean;
  toggleWatchlist: (payload: AddWatchlistPayload) => Promise<void>;
  removeFromWatchlist: (idOrTargetId: string) => Promise<void>;
  refreshWatchlist: () => Promise<void>;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

export const WatchlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [watchlist, setWatchlist] = useState<Watchlist[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { success, error } = useToast();

  const fetchWatchlist = useCallback(async () => {
    try {
      setLoading(true);
      const res = await watchlistService.getWatchlist();
      if (res.success && res.data) {
        setWatchlist(res.data);
      }
    } catch (err) {
      console.error('Error loading watchlist:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  const isSaved = useCallback((targetId: string): boolean => {
    return watchlist.some((item) =>
      item.id === targetId ||
      String(item.tmdbId) === targetId ||
      item.movieId === targetId ||
      item.seriesId === targetId
    );
  }, [watchlist]);

  const toggleWatchlist = async (payload: AddWatchlistPayload) => {
    const targetId = String(payload.tmdbId || payload.movieId || payload.seriesId);
    if (!targetId) return;

    const alreadySaved = isSaved(targetId);

    if (alreadySaved) {
      try {
        await watchlistService.removeFromWatchlist(targetId);
        setWatchlist((prev) => prev.filter((item) =>
          item.id !== targetId &&
          String(item.tmdbId) !== targetId &&
          item.movieId !== targetId &&
          item.seriesId !== targetId
        ));
        success(`Removed "${payload.title || 'Item'}" from My List`);
      } catch (err: any) {
        error(err.message || 'Failed to update watchlist');
      }
    } else {
      try {
        const res = await watchlistService.addToWatchlist(payload);
        if (res.success && res.data) {
          setWatchlist((prev) => [res.data, ...prev]);
          success(`Added "${payload.title || 'Item'}" to My List`);
        }
      } catch (err: any) {
        error(err.message || 'Failed to add to watchlist');
      }
    }
  };

  const removeFromWatchlist = async (idOrTargetId: string) => {
    try {
      await watchlistService.removeFromWatchlist(idOrTargetId);
      setWatchlist((prev) => prev.filter((item) =>
        item.id !== idOrTargetId &&
        String(item.tmdbId) !== idOrTargetId &&
        item.movieId !== idOrTargetId &&
        item.seriesId !== idOrTargetId
      ));
      success('Removed from My List');
    } catch (err: any) {
      error(err.message || 'Failed to remove item');
    }
  };

  return (
    <WatchlistContext.Provider
      value={{
        watchlist,
        loading,
        isSaved,
        toggleWatchlist,
        removeFromWatchlist,
        refreshWatchlist: fetchWatchlist,
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
};

export function useWatchlist() {
  const context = useContext(WatchlistContext);
  if (!context) throw new Error('useWatchlist must be used within a WatchlistProvider');
  return context;
}
