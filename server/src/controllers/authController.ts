import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';
import { AuthenticatedRequest } from '../middleware/auth';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, password } = req.body;
      if (!name || !email || !password) {
        res.status(400).json({ success: false, message: 'Name, email, and password are required' });
        return;
      }

      if (password.length < 6) {
        res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
        return;
      }

      const result = await authService.register(name, email, password);
      res.status(201).json({
        success: true,
        message: 'Account created successfully',
        data: result
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || 'Registration failed' });
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({ success: false, message: 'Email and password are required' });
        return;
      }

      const result = await authService.login(email, password);
      res.status(200).json({
        success: true,
        message: 'Logged in successfully',
        data: result
      });
    } catch (error: any) {
      res.status(401).json({ success: false, message: error.message || 'Invalid credentials' });
    }
  }

  async firebaseSync(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { idToken, email, name, avatar, uid } = req.body;
      if (!email) {
        res.status(400).json({ success: false, message: 'Email is required' });
        return;
      }

      const result = await authService.firebaseSync({ idToken, email, name, avatar, uid });
      res.status(200).json({
        success: true,
        message: 'Authenticated successfully',
        data: result
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || 'Authentication failed' });
    }
  }

  async me(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const user = await authService.getUserById(req.user.userId);
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error: any) {
      next(error);
    }
  }

  async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { name, avatar } = req.body;
      const updated = await authService.updateProfile(req.user.userId, { name, avatar });
      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: updated
      });
    } catch (error: any) {
      next(error);
    }
  }
}

export const authController = new AuthController();
