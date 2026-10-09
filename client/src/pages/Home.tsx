import React, { useState, useEffect } from 'react';
import { tmdbService } from '../services/tmdbService';
import { progressService } from '../services/progressService';
import { MediaItem, WatchProgress, Genre } from '../types';
import { HeroBanner } from '../components/HeroBanner';
import { NetflixRow } from '../components/NetflixRow';
import { Top10Row } from '../components/Top10Row';
import { HeroSkeleton, CardSkeleton } from '../components/LoadingSkeleton';
import { useAuth } from '../store/AuthContext';

export const Home: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  const [featured, setFeatured] = useState<MediaItem[]>([]);
  const [continueWatching, setContinueWatching] = useState<WatchProgress[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<MediaItem[]>([]);
  const [trendingSeries, setTrendingSeries] = useState<MediaItem[]>([]);
  const [popularMovies, setPopularMovies] = useState<MediaItem[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<MediaItem[]>([]);
  const [popularSeries, setPopularSeries] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [
          featRes,
          trendMRes,
          trendSRes,
          popMRes,
          topMRes,
          popSRes,
        ] = await Promise.all([
          tmdbService.getFeatured().catch(() => ({ success: false, data: [] })),
          tmdbService.getTrendingMovies('week').catch(() => ({ success: false, data: [] })),
          tmdbService.getTrendingSeries('week').catch(() => ({ success: false, data: [] })),
          tmdbService.getPopularMovies(1).catch(() => ({ success: false, results: [] })),
          tmdbService.getTopRatedMovies(1).catch(() => ({ success: false, results: [] })),
          tmdbService.getPopularSeries(1).catch(() => ({ success: false, results: [] })),
        ]);

        if (featRes.success && featRes.data?.length > 0) {
          setFeatured(featRes.data);
        } else if (trendMRes.success && trendMRes.data?.length > 0) {
          setFeatured(trendMRes.data.slice(0, 5));
        }

        if (trendMRes.success && trendMRes.data) setTrendingMovies(trendMRes.data);
        if (trendSRes.success && trendSRes.data) setTrendingSeries(trendSRes.data);
        if (popMRes.success && popMRes.results) setPopularMovies(popMRes.results);
        if (topMRes.success && topMRes.results) setTopRatedMovies(topMRes.results);
        if (popSRes.success && popSRes.results) setPopularSeries(popSRes.results);

        // Fetch continue watching if user is logged in
        if (isAuthenticated) {
          try {
            const cwRes = await progressService.getContinueWatching();
            if (cwRes.success && cwRes.data) {
              setContinueWatching(cwRes.data);
            }
          } catch (err) {
            console.warn('Could not load continue watching:', err);
          }
        }
      } catch (err) {
        console.error('Error loading home feed:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="bg-[#141414] min-h-screen">
        <HeroSkeleton />
        <div className="max-w-7xl mx-auto px-4 md:px-12 py-10 space-y-12">
          <CardSkeleton count={6} aspect="backdrop" />
          <CardSkeleton count={6} aspect="poster" />
        </div>
      </div>
    );
  }

  // Combined Top 10 list
  const top10Combined = [
    ...(trendingMovies.slice(0, 5)),
    ...(trendingSeries.slice(0, 5))
  ];

  return (
    <div className="bg-[#141414] min-h-screen text-white pb-20 -mt-4 sm:-mt-8">
      {/* Netflix Billboard Hero Carousel */}
      <HeroBanner items={featured} />

      {/* Main Content Rows Section */}
      <div className="relative z-20 -mt-16 sm:-mt-24 md:-mt-32 space-y-6">
        {/* Continue Watching for [User] */}
        {continueWatching.length > 0 && (
          <NetflixRow
            title={`Continue Watching for ${user?.name || 'You'}`}
            items={continueWatching}
            aspect="backdrop"
          />
        )}

        {/* Netflix Top 10 Row with Giant Numbers */}
        {top10Combined.length > 0 && (
          <Top10Row
            title="Top 10 in Movies & TV Shows Today"
            items={top10Combined}
          />
        )}

        {/* Trending Now */}
        {trendingMovies.length > 0 && (
          <NetflixRow
            title="Trending Now"
            items={trendingMovies}
            aspect="backdrop"
            exploreHref="/movies"
          />
        )}

        {/* Popular on Pixell / Blockbuster Cinema */}
        {popularMovies.length > 0 && (
          <NetflixRow
            title="Popular on Pixell"
            items={popularMovies}
            aspect="poster"
            exploreHref="/movies"
          />
        )}

        {/* Binge-worthy TV Series */}
        {trendingSeries.length > 0 && (
          <NetflixRow
            title="Binge-Worthy TV Shows"
            items={trendingSeries}
            aspect="backdrop"
            exploreHref="/series"
          />
        )}

        {/* Top Rated Masterpieces */}
        {topRatedMovies.length > 0 && (
          <NetflixRow
            title="Critically Acclaimed Movies"
            items={topRatedMovies}
            aspect="backdrop"
            exploreHref="/movies"
          />
        )}

        {/* Hit TV Series & Dramas */}
        {popularSeries.length > 0 && (
          <NetflixRow
            title="Top TV Dramas & Comedies"
            items={popularSeries}
            aspect="poster"
            exploreHref="/series"
          />
        )}
      </div>
    </div>
  );
};
