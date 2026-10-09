import { v4 as uuidv4 } from 'uuid';
import { dbManager } from '../config/db';
import { Season, Episode } from '../models/types';

export class EpisodeService {
  async getSeasonsBySeriesId(seriesId: string): Promise<Season[]> {
    const adapter = await dbManager.getAdapter();

    if (adapter.isPostgres) {
      const res = await adapter.query(`
        SELECT sea.*, 
          COALESCE(
            json_agg(
              json_build_object(
                'id', ep.id,
                'seasonId', ep.season_id,
                'title', ep.title,
                'description', ep.description,
                'episodeNumber', ep.episode_number,
                'duration', ep.duration,
                'thumbnailUrl', ep.thumbnail_url,
                'videoUrl', ep.video_url,
                'releaseDate', ep.release_date,
                'createdAt', ep.created_at,
                'updatedAt', ep.updated_at
              ) ORDER BY ep.episode_number ASC
            ) FILTER (WHERE ep.id IS NOT NULL), '[]'
          ) as episodes
        FROM seasons sea
        LEFT JOIN episodes ep ON sea.id = ep.season_id
        WHERE sea.series_id = $1
        GROUP BY sea.id
        ORDER BY sea.season_number ASC
      `, [seriesId]);

      return res.rows.map(sea => ({
        id: sea.id,
        seriesId: sea.series_id,
        seasonNumber: sea.season_number,
        title: sea.title,
        createdAt: sea.created_at,
        updatedAt: sea.updated_at,
        episodes: sea.episodes
      }));
    } else {
      const store = (adapter as any).getStore();
      const seasons = store.seasons
        .filter((s: any) => s.series_id === seriesId)
        .sort((a: any, b: any) => a.season_number - b.season_number);

      return seasons.map((sea: any) => {
        const episodes = store.episodes
          .filter((ep: any) => ep.season_id === sea.id)
          .sort((a: any, b: any) => a.episode_number - b.episode_number)
          .map((ep: any) => ({
            id: ep.id,
            seasonId: ep.season_id,
            title: ep.title,
            description: ep.description || '',
            episodeNumber: ep.episode_number,
            duration: ep.duration,
            thumbnailUrl: ep.thumbnail_url,
            videoUrl: ep.video_url,
            releaseDate: ep.release_date,
            createdAt: ep.created_at,
            updatedAt: ep.updated_at
          }));

        return {
          id: sea.id,
          seriesId: sea.series_id,
          seasonNumber: sea.season_number,
          title: sea.title,
          createdAt: sea.created_at,
          updatedAt: sea.updated_at,
          episodes
        };
      });
    }
  }

  async getEpisodesBySeasonId(seasonId: string): Promise<Episode[]> {
    const adapter = await dbManager.getAdapter();

    if (adapter.isPostgres) {
      const res = await adapter.query(
        'SELECT * FROM episodes WHERE season_id = $1 ORDER BY episode_number ASC',
        [seasonId]
      );
      return res.rows.map(ep => ({
        id: ep.id,
        seasonId: ep.season_id,
        title: ep.title,
        description: ep.description || '',
        episodeNumber: ep.episode_number,
        duration: ep.duration,
        thumbnailUrl: ep.thumbnail_url,
        videoUrl: ep.video_url,
        releaseDate: ep.release_date,
        createdAt: ep.created_at,
        updatedAt: ep.updated_at
      }));
    } else {
      const store = (adapter as any).getStore();
      return store.episodes
        .filter((ep: any) => ep.season_id === seasonId)
        .sort((a: any, b: any) => a.episode_number - b.episode_number)
        .map((ep: any) => ({
          id: ep.id,
          seasonId: ep.season_id,
          title: ep.title,
          description: ep.description || '',
          episodeNumber: ep.episode_number,
          duration: ep.duration,
          thumbnailUrl: ep.thumbnail_url,
          videoUrl: ep.video_url,
          releaseDate: ep.release_date,
          createdAt: ep.created_at,
          updatedAt: ep.updated_at
        }));
    }
  }

  async getEpisodeById(episodeId: string): Promise<(Episode & { seriesTitle?: string; seriesSlug?: string; seriesId?: string; seasonNumber?: number; seasonTitle?: string }) | null> {
    const adapter = await dbManager.getAdapter();

    if (adapter.isPostgres) {
      const res = await adapter.query(`
        SELECT ep.*, sea.season_number, sea.title as season_title, s.id as series_id, s.title as series_title, s.slug as series_slug
        FROM episodes ep
        JOIN seasons sea ON ep.season_id = sea.id
        JOIN series s ON sea.series_id = s.id
        WHERE ep.id = $1
      `, [episodeId]);

      if (res.rows.length === 0) return null;
      const r = res.rows[0];
      return {
        id: r.id,
        seasonId: r.season_id,
        title: r.title,
        description: r.description || '',
        episodeNumber: r.episode_number,
        duration: r.duration,
        thumbnailUrl: r.thumbnail_url,
        videoUrl: r.video_url,
        releaseDate: r.release_date,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        seriesId: r.series_id,
        seriesTitle: r.series_title,
        seriesSlug: r.series_slug,
        seasonNumber: r.season_number,
        seasonTitle: r.season_title
      };
    } else {
      const store = (adapter as any).getStore();
      const ep = store.episodes.find((e: any) => e.id === episodeId);
      if (!ep) return null;

      const sea = store.seasons.find((s: any) => s.id === ep.season_id);
      const ser = sea ? store.series.find((sr: any) => sr.id === sea.series_id) : null;

      return {
        id: ep.id,
        seasonId: ep.season_id,
        title: ep.title,
        description: ep.description || '',
        episodeNumber: ep.episode_number,
        duration: ep.duration,
        thumbnailUrl: ep.thumbnail_url,
        videoUrl: ep.video_url,
        releaseDate: ep.release_date,
        createdAt: ep.created_at,
        updatedAt: ep.updated_at,
        seriesId: ser?.id,
        seriesTitle: ser?.title,
        seriesSlug: ser?.slug,
        seasonNumber: sea?.season_number,
        seasonTitle: sea?.title
      };
    }
  }

  async createSeason(seriesId: string, seasonNumber: number, title: string): Promise<Season> {
    const adapter = await dbManager.getAdapter();
    const id = uuidv4();
    const now = new Date().toISOString();

    if (adapter.isPostgres) {
      await adapter.query(`
        INSERT INTO seasons (id, series_id, season_number, title, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [id, seriesId, seasonNumber, title, now, now]);

      return {
        id,
        seriesId,
        seasonNumber,
        title,
        createdAt: now,
        updatedAt: now,
        episodes: []
      };
    } else {
      const store = (adapter as any).getStore();
      const newSeason = {
        id,
        series_id: seriesId,
        season_number: seasonNumber,
        title,
        created_at: now,
        updated_at: now
      };
      store.seasons.push(newSeason);
      (adapter as any).saveStore();

      return {
        id,
        seriesId,
        seasonNumber,
        title,
        createdAt: now,
        updatedAt: now,
        episodes: []
      };
    }
  }

  async updateSeason(seasonId: string, data: { seasonNumber?: number; title?: string }): Promise<Season> {
    const adapter = await dbManager.getAdapter();
    const now = new Date().toISOString();

    if (adapter.isPostgres) {
      const res = await adapter.query(`
        UPDATE seasons SET
          season_number = COALESCE($1, season_number),
          title = COALESCE($2, title),
          updated_at = $3
        WHERE id = $4
        RETURNING *
      `, [data.seasonNumber, data.title, now, seasonId]);

      if (res.rows.length === 0) throw new Error('Season not found');
      const r = res.rows[0];
      return {
        id: r.id,
        seriesId: r.series_id,
        seasonNumber: r.season_number,
        title: r.title,
        createdAt: r.created_at,
        updatedAt: r.updated_at
      };
    } else {
      const store = (adapter as any).getStore();
      const sea = store.seasons.find((s: any) => s.id === seasonId);
      if (!sea) throw new Error('Season not found');

      if (data.seasonNumber !== undefined) sea.season_number = data.seasonNumber;
      if (data.title !== undefined) sea.title = data.title;
      sea.updated_at = now;
      (adapter as any).saveStore();

      return {
        id: sea.id,
        seriesId: sea.series_id,
        seasonNumber: sea.season_number,
        title: sea.title,
        createdAt: sea.created_at,
        updatedAt: sea.updated_at
      };
    }
  }

  async deleteSeason(seasonId: string): Promise<boolean> {
    const adapter = await dbManager.getAdapter();

    if (adapter.isPostgres) {
      const res = await adapter.query('DELETE FROM seasons WHERE id = $1', [seasonId]);
      return res.rowCount > 0;
    } else {
      const store = (adapter as any).getStore();
      const initial = store.seasons.length;
      store.seasons = store.seasons.filter((s: any) => s.id !== seasonId);
      store.episodes = store.episodes.filter((e: any) => e.season_id !== seasonId);
      (adapter as any).saveStore();
      return store.seasons.length < initial;
    }
  }

  async createEpisode(seasonId: string, data: Partial<Episode>): Promise<Episode> {
    const adapter = await dbManager.getAdapter();
    const id = uuidv4();
    const now = new Date().toISOString();

    if (adapter.isPostgres) {
      await adapter.query(`
        INSERT INTO episodes (id, season_id, title, description, episode_number, duration, thumbnail_url, video_url, release_date, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [
        id,
        seasonId,
        data.title,
        data.description || '',
        data.episodeNumber || 1,
        data.duration || 45,
        data.thumbnailUrl,
        data.videoUrl,
        data.releaseDate || now.split('T')[0],
        now,
        now
      ]);

      return (await this.getEpisodeById(id))!;
    } else {
      const store = (adapter as any).getStore();
      const newEpisode = {
        id,
        season_id: seasonId,
        title: data.title,
        description: data.description || '',
        episode_number: data.episodeNumber || 1,
        duration: data.duration || 45,
        thumbnail_url: data.thumbnailUrl,
        video_url: data.videoUrl,
        release_date: data.releaseDate || now.split('T')[0],
        created_at: now,
        updated_at: now
      };

      store.episodes.push(newEpisode);
      (adapter as any).saveStore();
      return (await this.getEpisodeById(id))!;
    }
  }

  async updateEpisode(episodeId: string, data: Partial<Episode>): Promise<Episode> {
    const adapter = await dbManager.getAdapter();
    const now = new Date().toISOString();

    if (adapter.isPostgres) {
      await adapter.query(`
        UPDATE episodes SET
          title = COALESCE($1, title),
          description = COALESCE($2, description),
          episode_number = COALESCE($3, episode_number),
          duration = COALESCE($4, duration),
          thumbnail_url = COALESCE($5, thumbnail_url),
          video_url = COALESCE($6, video_url),
          release_date = COALESCE($7, release_date),
          updated_at = $8
        WHERE id = $9
      `, [
        data.title,
        data.description,
        data.episodeNumber,
        data.duration,
        data.thumbnailUrl,
        data.videoUrl,
        data.releaseDate,
        now,
        episodeId
      ]);

      return (await this.getEpisodeById(episodeId))!;
    } else {
      const store = (adapter as any).getStore();
      const ep = store.episodes.find((e: any) => e.id === episodeId);
      if (!ep) throw new Error('Episode not found');

      if (data.title !== undefined) ep.title = data.title;
      if (data.description !== undefined) ep.description = data.description;
      if (data.episodeNumber !== undefined) ep.episode_number = data.episodeNumber;
      if (data.duration !== undefined) ep.duration = data.duration;
      if (data.thumbnailUrl !== undefined) ep.thumbnail_url = data.thumbnailUrl;
      if (data.videoUrl !== undefined) ep.video_url = data.videoUrl;
      if (data.releaseDate !== undefined) ep.release_date = data.releaseDate;
      ep.updated_at = now;

      (adapter as any).saveStore();
      return (await this.getEpisodeById(episodeId))!;
    }
  }

  async deleteEpisode(episodeId: string): Promise<boolean> {
    const adapter = await dbManager.getAdapter();

    if (adapter.isPostgres) {
      const res = await adapter.query('DELETE FROM episodes WHERE id = $1', [episodeId]);
      return res.rowCount > 0;
    } else {
      const store = (adapter as any).getStore();
      const initial = store.episodes.length;
      store.episodes = store.episodes.filter((e: any) => e.id !== episodeId);
      store.watch_progress = store.watch_progress.filter((p: any) => p.episode_id !== episodeId);
      store.watch_history = store.watch_history.filter((h: any) => h.episode_id !== episodeId);
      (adapter as any).saveStore();
      return store.episodes.length < initial;
    }
  }

  async getNextEpisode(currentEpisodeId: string): Promise<Episode | null> {
    const current = await this.getEpisodeById(currentEpisodeId);
    if (!current) return null;

    const episodesInSeason = await this.getEpisodesBySeasonId(current.seasonId);
    const currentIndex = episodesInSeason.findIndex(e => e.id === currentEpisodeId);

    if (currentIndex !== -1 && currentIndex < episodesInSeason.length - 1) {
      return episodesInSeason[currentIndex + 1];
    }

    // Try next season
    if (current.seriesId) {
      const seasons = await this.getSeasonsBySeriesId(current.seriesId);
      const currentSeasonIndex = seasons.findIndex(s => s.id === current.seasonId);
      if (currentSeasonIndex !== -1 && currentSeasonIndex < seasons.length - 1) {
        const nextSeason = seasons[currentSeasonIndex + 1];
        const nextEpisodes = await this.getEpisodesBySeasonId(nextSeason.id);
        if (nextEpisodes.length > 0) {
          return nextEpisodes[0];
        }
      }
    }

    return null;
  }
}

export const episodeService = new EpisodeService();
