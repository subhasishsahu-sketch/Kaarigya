// server/modules/auth/auth.controller.ts
import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../../config/supabase';
import { sendSuccess, sendError } from '../../utils/responseEnvelope';
import { ERROR_CODES } from '../../config/constants';
import { UserRole } from '../../types';

export const authRouter = Router();

// GET /api/auth/me - Return currently authenticated user profile
authRouter.get('/me', (req: Request, res: Response) => {
  if (!req.user) {
    return sendError(res, ERROR_CODES.UNAUTHORIZED, 'Not authenticated', 401);
  }
  return sendSuccess(res, {
    user: req.user,
    artisanProfile: db.artisans.get(req.user.id),
    cooperativeProfile: db.cooperatives.get(req.user.id)
  });
});

// POST /api/auth/switch-role - For seamless role testing in the platform
authRouter.post('/switch-role', (req: Request, res: Response) => {
  const { role } = req.body;
  const validRoles: UserRole[] = ['ARTISAN', 'BUYER', 'COOPERATIVE', 'REVIEWER', 'ADMIN'];

  if (!validRoles.includes(role)) {
    return sendError(res, ERROR_CODES.VALIDATION_ERROR, `Invalid role. Allowed: ${validRoles.join(', ')}`, 400);
  }

  // Find a suitable seeded user for the requested role
  const user = Array.from(db.users.values()).find(u => u.role === role);
  if (!user) {
    return sendError(res, ERROR_CODES.NOT_FOUND, `No demo user found for role '${role}'`, 404);
  }

  return sendSuccess(res, {
    token: `user-${user.id}`,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber
    },
    artisanProfile: db.artisans.get(user.id),
    cooperativeProfile: db.cooperatives.get(user.id)
  });
});

// GET /api/auth/users - List available demo users
authRouter.get('/demo-users', (req: Request, res: Response) => {
  const users = Array.from(db.users.values()).map(u => ({
    id: u.id,
    email: u.email,
    role: u.role,
    fullName: u.fullName,
    token: `user-${u.id}`
  }));
  return sendSuccess(res, users);
});

// POST /api/auth/register-artisan - Register a new Artisan and submit verification request to selected Cooperative
authRouter.post('/register-artisan', (req: Request, res: Response) => {
  const { 
    fullName, 
    email, 
    phoneNumber, 
    craftSpecialties, 
    experienceYears, 
    regionState, 
    district, 
    clusterName, 
    cooperativeId, 
    preferredLang, 
    bio 
  } = req.body;

  if (!fullName || !email || !phoneNumber || !craftSpecialties || !regionState || !district || !cooperativeId) {
    return sendError(
      res, 
      ERROR_CODES.VALIDATION_ERROR, 
      'Missing required registration fields: fullName, email, phoneNumber, craftSpecialties, regionState, district, cooperativeId', 
      400
    );
  }

  // Find target Cooperative
  const cooperative = db.cooperatives.get(cooperativeId);
  if (!cooperative) {
    return sendError(res, ERROR_CODES.VALIDATION_ERROR, `Selected Cooperative '${cooperativeId}' does not exist.`, 400);
  }

  // Prevent duplicate active verification requests (same email or phone number)
  const normEmail = email.trim().toLowerCase();
  const normPhone = phoneNumber.trim();

  const existingArtisan = Array.from(db.artisans.values()).find(a => {
    const user = db.users.get(a.id);
    const emailMatch = (a as any).email?.toLowerCase() === normEmail || user?.email?.toLowerCase() === normEmail;
    const phoneMatch = (a as any).phone === normPhone || user?.phoneNumber === normPhone;
    return (emailMatch || phoneMatch) && (a.verificationStatus === 'PENDING' || a.verificationStatus === 'VERIFIED');
  });

  if (existingArtisan) {
    return sendError(
      res, 
      ERROR_CODES.VALIDATION_ERROR, 
      'An active registration or verification request already exists for this email or phone number.', 
      400
    );
  }

  const userId = `artisan-usr-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date().toISOString();

  // Create User entity
  const newUser = {
    id: userId,
    email: normEmail,
    role: 'ARTISAN' as UserRole,
    fullName: fullName.trim(),
    phoneNumber: normPhone,
    isActive: true,
    createdAt: now,
    updatedAt: now
  };
  db.users.set(userId, newUser);

  // Create Artisan entity
  const newArtisan = {
    id: userId,
    cooperativeId: cooperative.id,
    cooperativeName: cooperative.name,
    fullName: fullName.trim(),
    craftSpecialties: Array.isArray(craftSpecialties) ? craftSpecialties : [craftSpecialties],
    experienceYears: Number(experienceYears) || 1,
    regionState: regionState.trim(),
    district: district.trim(),
    clusterName: clusterName ? clusterName.trim() : '',
    preferredLang: preferredLang || 'en',
    bio: bio ? bio.trim() : `Master artisan specializing in ${Array.isArray(craftSpecialties) ? craftSpecialties.join(', ') : craftSpecialties}.`,
    avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=5D634C&color=fff`,
    verificationStatus: 'PENDING' as const,
    kalakritiArtisanId: undefined, // Not set until accepted by Cooperative
    createdAt: now
  };
  db.artisans.set(userId, newArtisan);

  return sendSuccess(res, {
    token: `user-${userId}`,
    user: {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      fullName: newUser.fullName,
      phoneNumber: newUser.phoneNumber,
      cooperativeId: cooperative.id
    },
    artisanProfile: newArtisan,
    message: `Artisan registration completed. Verification request submitted to ${cooperative.name}. Status: PENDING.`
  }, 201);
});
