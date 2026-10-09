import { v4 as uuidv4 } from 'uuid';
import { dbManager } from '../config/db';
import { Genre } from '../models/types';
import { slugify } from '../utils/slugify';

export class GenreService {
  async getGenres(): Promise<Genre[]> {
    const adapter = await dbManager.getAdapter();

    if (adapter.isPostgres) {
      const res = await adapter.query<Genre>('SELECT * FROM genres ORDER BY name ASC');
      return res.rows;
    } else {
      const store = (adapter as any).getStore();
      return [...store.genres].sort((a: any, b: any) => a.name.localeCompare(b.name));
    }
  }

  async getGenreBySlug(slug: string): Promise<Genre | null> {
    const adapter = await dbManager.getAdapter();

    if (adapter.isPostgres) {
      const res = await adapter.query<Genre>('SELECT * FROM genres WHERE slug = $1 OR id = $1', [slug]);
      return res.rows[0] || null;
    } else {
      const store = (adapter as any).getStore();
      return store.genres.find((g: any) => g.slug === slug || g.id === slug) || null;
    }
  }

  async createGenre(name: string, customSlug?: string): Promise<Genre> {
    const adapter = await dbManager.getAdapter();
    const id = `g-${Date.now()}`;
    const slug = customSlug ? slugify(customSlug) : slugify(name);

    if (adapter.isPostgres) {
      const res = await adapter.query<Genre>(
        'INSERT INTO genres (id, name, slug) VALUES ($1, $2, $3) RETURNING *',
        [id, name, slug]
      );
      return res.rows[0];
    } else {
      const store = (adapter as any).getStore();
      const newGenre = { id, name, slug };
      store.genres.push(newGenre);
      (adapter as any).saveStore();
      return newGenre;
    }
  }

  async updateGenre(id: string, name: string, customSlug?: string): Promise<Genre> {
    const adapter = await dbManager.getAdapter();
    const slug = customSlug ? slugify(customSlug) : slugify(name);

    if (adapter.isPostgres) {
      const res = await adapter.query<Genre>(
        'UPDATE genres SET name = $1, slug = $2 WHERE id = $3 RETURNING *',
        [name, slug, id]
      );
      if (res.rows.length === 0) throw new Error('Genre not found');
      return res.rows[0];
    } else {
      const store = (adapter as any).getStore();
      const g = store.genres.find((item: any) => item.id === id);
      if (!g) throw new Error('Genre not found');
      g.name = name;
      g.slug = slug;
      (adapter as any).saveStore();
      return g;
    }
  }

  async deleteGenre(id: string): Promise<boolean> {
    const adapter = await dbManager.getAdapter();

    if (adapter.isPostgres) {
      const res = await adapter.query('DELETE FROM genres WHERE id = $1', [id]);
      return res.rowCount > 0;
    } else {
      const store = (adapter as any).getStore();
      const initial = store.genres.length;
      store.genres = store.genres.filter((g: any) => g.id !== id);
      store.movie_genres = store.movie_genres.filter((mg: any) => mg.genre_id !== id);
      store.series_genres = store.series_genres.filter((sg: any) => sg.genre_id !== id);
      (adapter as any).saveStore();
      return store.genres.length < initial;
    }
  }
}

export const genreService = new GenreService();
