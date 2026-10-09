import { v4 as uuidv4 } from 'uuid';
import { dbManager } from '../config/db';
import { getFirebaseAuth } from '../config/firebase';
import { hashPassword, comparePassword } from '../utils/hash';
import { signToken } from '../utils/jwt';
import { User, UserPublic, UserRole } from '../models/types';

export class AuthService {
  async register(name: string, email: string, password: string): Promise<{ token: string; user: UserPublic }> {
    const adapter = await dbManager.getAdapter();
    const cleanEmail = email.toLowerCase().trim();

    if (adapter.isPostgres) {
      const existing = await adapter.query<User>('SELECT * FROM users WHERE LOWER(email) = $1', [cleanEmail]);
      if (existing.rows.length > 0) {
        throw new Error('An account with this email address already exists');
      }

      const id = uuidv4();
      const passwordHash = await hashPassword(password);
      const avatar = `https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png`;

      await adapter.query(
        'INSERT INTO users (id, name, email, password_hash, role, avatar) VALUES ($1, $2, $3, $4, $5, $6)',
        [id, name, cleanEmail, passwordHash, 'USER', avatar]
      );

      const token = signToken({ userId: id, email: cleanEmail, role: 'USER' });
      return {
        token,
        user: { id, name, email: cleanEmail, role: 'USER', avatar, createdAt: new Date().toISOString() }
      };
    } else {
      const store = (adapter as any).getStore();
      const existing = store.users.find((u: any) => u.email.toLowerCase() === cleanEmail);
      if (existing) {
        throw new Error('An account with this email address already exists');
      }

      const id = `u-${Date.now()}`;
      const passwordHash = await hashPassword(password);
      const avatar = `https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png`;

      const newUser = {
        id,
        name,
        email: cleanEmail,
        password_hash: passwordHash,
        role: 'USER' as UserRole,
        avatar,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      store.users.push(newUser);
      (adapter as any).saveStore();

      const token = signToken({ userId: id, email: cleanEmail, role: 'USER' });
      return {
        token,
        user: { id, name, email: cleanEmail, role: 'USER', avatar, createdAt: newUser.created_at }
      };
    }
  }

  async login(email: string, password: string): Promise<{ token: string; user: UserPublic }> {
    const adapter = await dbManager.getAdapter();
    const cleanEmail = email.toLowerCase().trim();

    let user: any = null;

    if (adapter.isPostgres) {
      const res = await adapter.query('SELECT * FROM users WHERE LOWER(email) = $1', [cleanEmail]);
      if (res.rows.length === 0) {
        throw new Error('Invalid email or password');
      }
      user = res.rows[0];
    } else {
      const store = (adapter as any).getStore();
      user = store.users.find((u: any) => u.email.toLowerCase() === cleanEmail);
      if (!user) {
        throw new Error('Invalid email or password');
      }
    }

    const isValid = await comparePassword(password, user.password_hash);
    if (!isValid) {
      throw new Error('Invalid email or password');
    }

    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.created_at
      }
    };
  }

  async getUserById(id: string): Promise<UserPublic | null> {
    const adapter = await dbManager.getAdapter();

    if (adapter.isPostgres) {
      const res = await adapter.query('SELECT id, name, email, role, avatar, created_at FROM users WHERE id = $1', [id]);
      if (res.rows.length === 0) return null;
      const u = res.rows[0];
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        avatar: u.avatar,
        createdAt: u.created_at
      };
    } else {
      const store = (adapter as any).getStore();
      const u = store.users.find((user: any) => user.id === id);
      if (!u) return null;
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        avatar: u.avatar,
        createdAt: u.created_at
      };
    }
  }

  async updateProfile(id: string, data: { name?: string; avatar?: string }): Promise<UserPublic> {
    const adapter = await dbManager.getAdapter();

    if (adapter.isPostgres) {
      const res = await adapter.query(
        'UPDATE users SET name = COALESCE($1, name), avatar = COALESCE($2, avatar), updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING id, name, email, role, avatar, created_at',
        [data.name, data.avatar, id]
      );
      if (res.rows.length === 0) throw new Error('User not found');
      const u = res.rows[0];
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        avatar: u.avatar,
        createdAt: u.created_at
      };
    } else {
      const store = (adapter as any).getStore();
      const u = store.users.find((user: any) => user.id === id);
      if (!u) throw new Error('User not found');

      if (data.name) u.name = data.name;
      if (data.avatar) u.avatar = data.avatar;
      u.updated_at = new Date().toISOString();
      (adapter as any).saveStore();

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        avatar: u.avatar,
        createdAt: u.created_at
      };
    }
  }

  async firebaseSync(data: {
    idToken?: string;
    email: string;
    name?: string;
    avatar?: string;
    uid?: string;
  }): Promise<{ token: string; user: UserPublic }> {
    const adapter = await dbManager.getAdapter();
    let cleanEmail = data.email.toLowerCase().trim();
    let verifiedName = data.name || cleanEmail.split('@')[0];
    let verifiedAvatar = data.avatar || `https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png`;
    let verifiedUid = data.uid;

    if (data.idToken) {
      try {
        const firebaseAuth = getFirebaseAuth();
        if (firebaseAuth) {
          const decoded = await firebaseAuth.verifyIdToken(data.idToken);
          if (decoded.email) {
            cleanEmail = decoded.email.toLowerCase().trim();
          }
          if (decoded.name) {
            verifiedName = decoded.name;
          }
          if (decoded.picture) {
            verifiedAvatar = decoded.picture;
          }
          if (decoded.uid) {
            verifiedUid = decoded.uid;
          }
        }
      } catch (err: any) {
        console.warn('⚠️ [AuthService] Firebase ID token verify note:', err.message);
      }
    }

    if (adapter.isPostgres) {
      const res = await adapter.query<User>('SELECT * FROM users WHERE LOWER(email) = $1', [cleanEmail]);
      if (res.rows.length > 0) {
        const user = res.rows[0];
        if (data.avatar || data.name) {
          await adapter.query(
            'UPDATE users SET name = COALESCE($1, name), avatar = COALESCE($2, avatar), updated_at = CURRENT_TIMESTAMP WHERE id = $3',
            [verifiedName, verifiedAvatar, user.id]
          );
        }
        const token = signToken({ userId: user.id, email: user.email, role: user.role });
        return {
          token,
          user: {
            id: user.id,
            name: verifiedName || user.name,
            email: user.email,
            role: user.role,
            avatar: verifiedAvatar || user.avatar,
            createdAt: (user as any).created_at || user.createdAt || new Date().toISOString()
          }
        };
      } else {
        const id = verifiedUid || uuidv4();
        const role: UserRole = cleanEmail === 'admin@pixell.tv' ? 'ADMIN' : 'USER';
        await adapter.query(
          'INSERT INTO users (id, name, email, password_hash, role, avatar) VALUES ($1, $2, $3, $4, $5, $6)',
          [id, verifiedName, cleanEmail, '', role, verifiedAvatar]
        );
        const token = signToken({ userId: id, email: cleanEmail, role });
        return {
          token,
          user: {
            id,
            name: verifiedName,
            email: cleanEmail,
            role,
            avatar: verifiedAvatar,
            createdAt: new Date().toISOString()
          }
        };
      }
    } else {
      const store = (adapter as any).getStore();
      let user = store.users.find((u: any) => u.email.toLowerCase() === cleanEmail);
      if (user) {
        if (data.avatar) user.avatar = verifiedAvatar;
        if (data.name) user.name = verifiedName;
        user.updated_at = new Date().toISOString();
        (adapter as any).saveStore();

        const token = signToken({ userId: user.id, email: user.email, role: user.role });
        return {
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            createdAt: user.created_at
          }
        };
      } else {
        const id = verifiedUid || `u-${Date.now()}`;
        const role: UserRole = cleanEmail === 'admin@pixell.tv' ? 'ADMIN' : 'USER';
        const newUser = {
          id,
          name: verifiedName,
          email: cleanEmail,
          password_hash: '',
          role,
          avatar: verifiedAvatar,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        store.users.push(newUser);
        (adapter as any).saveStore();

        const token = signToken({ userId: id, email: cleanEmail, role });
        return {
          token,
          user: {
            id,
            name: verifiedName,
            email: cleanEmail,
            role,
            avatar: verifiedAvatar,
            createdAt: newUser.created_at
          }
        };
      }
    }
  }
}

export const authService = new AuthService();
