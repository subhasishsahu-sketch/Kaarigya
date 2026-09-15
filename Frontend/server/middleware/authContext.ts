// server/middleware/authContext.ts
import { Request, Response, NextFunction } from 'express';
import { db, getSupabase } from '../config/supabase';
import { AuthUser, UserRole } from '../types';

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

/**
 * Authentication Middleware
 * Validates Supabase JWT or authorized demo token (when DEMO_MODE is active),
 * loads verified user record from DB, and attaches `req.user`.
 */
export async function authContext(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1]?.trim();

    if (!token) {
      return next();
    }

    // 1. Try Supabase Auth JWT verification if Supabase is connected
    const supabase = getSupabase();
    if (supabase) {
      const { data: { user: sbUser }, error } = await supabase.auth.getUser(token);
      if (sbUser && !error) {
        const dbUser = db.users.get(sbUser.id);
        if (dbUser && dbUser.isActive) {
          req.user = {
            id: dbUser.id,
            email: dbUser.email,
            role: dbUser.role as UserRole,
            fullName: dbUser.fullName,
            phoneNumber: dbUser.phoneNumber,
            cooperativeId: db.artisans.get(dbUser.id)?.cooperativeId
          };
          return next();
        }
      }
    }

    // 2. Demo token evaluation (ONLY enabled when DEMO_MODE != 'false')
    const isDemoMode = process.env.DEMO_MODE !== 'false';

    if (isDemoMode) {
      let foundUser: any = null;

      const demoUserMap: Record<string, string> = {
        'demo-artisan': '33333333-3333-3333-3333-333333333333',
        'demo-coop': '11111111-1111-1111-1111-111111111111',
        'demo-reviewer': '66666666-6666-6666-6666-666666666666',
        'demo-admin': '77777777-7777-7777-7777-777777777777',
        'demo-buyer': '88888888-8888-8888-8888-888888888888',
      };

      if (token.startsWith('user-')) {
        const userId = token.replace('user-', '');
        foundUser = db.users.get(userId);
      } else if (demoUserMap[token]) {
        foundUser = db.users.get(demoUserMap[token]);
      } else {
        foundUser = db.users.get(token);
      }

      if (foundUser && foundUser.isActive) {
        req.user = {
          id: foundUser.id,
          email: foundUser.email,
          role: foundUser.role as UserRole,
          fullName: foundUser.fullName,
          phoneNumber: foundUser.phoneNumber,
          cooperativeId: db.artisans.get(foundUser.id)?.cooperativeId
        };
      }
    }

    next();
  } catch (err) {
    console.error('Error resolving auth context:', err);
    next();
  }
}
