import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.model';
import ApiError from '../utils/ApiError';
import { redis } from '../config/redis';

// Helper to generate tokens
const generateTokens = (id: string) => {
  const accessToken = jwt.sign(
    { id },
    process.env.JWT_SECRET as string,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' } as jwt.SignOptions // Fixes TypeScript overload
  );
  const refreshToken = jwt.sign(
    { id },
    process.env.JWT_REFRESH_SECRET as string,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' } as jwt.SignOptions // Fixes TypeScript overload
  );
  return { accessToken, refreshToken };
};

// REGISTER
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ApiError(400, 'Email already registered'));
    }

    const user = await User.create({ email, password, name, role });
    
    const { accessToken, refreshToken } = generateTokens(user._id.toString());
    user.refreshToken = refreshToken;
    await user.save();

    const userObject = user.toObject();
    // 🔁 Replace 'delete' with destructuring to satisfy TypeScript
    const { password: _, refreshToken: __, ...safeUser } = userObject;

    res.status(201).json({
      statusCode: 201,
      data: { user: safeUser, accessToken, refreshToken },
      message: 'User registered successfully',
    });
  } catch (error) {
    next(error);
  }
};

// LOGIN
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return next(new ApiError(401, 'Invalid email or password'));
    }

    const { accessToken, refreshToken } = generateTokens(user._id.toString());
    user.refreshToken = refreshToken;
    await user.save();

    const userObject = user.toObject();
    // 🔁 Replace 'delete' with destructuring
    const { password: _, refreshToken: __, ...safeUser } = userObject;

    res.status(200).json({
      statusCode: 200,
      data: { user: safeUser, accessToken, refreshToken },
      message: 'User logged in successfully',
    });
  } catch (error) {
    next(error);
  }
};

// 🛑 LOGOUT (Blacklists token in Redis)
export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as jwt.JwtPayload;
        const expiresIn = (decoded.exp || 0) - Math.floor(Date.now() / 1000);

        // Blacklist the token for the exact remaining time
        if (expiresIn > 0 && redis) {
          await redis.setex(`blacklist:${token}`, expiresIn, 'true');
        }
      } catch (err) {
        // If token is already expired, we just ignore the error and log them out anyway
      }
    }

    // Optional: Also clear refreshToken from DB for full logout
    const user = (req as any).user;
    if (user) {
      user.refreshToken = null;
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

// 🆕 GET CURRENT USER
export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// 🆕 UPDATE CURRENT USER (using .save() to trigger password hash)
export const updateMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;
    const userId = (req as any).user._id;

    const user = await User.findById(userId);
    if (!user) return next(new ApiError(404, 'User not found'));

    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = password;

    // ⚠️ Important: We use .save() so your UserSchema.pre('save') middleware hashes the password!
    await user.save();

    const userObject = user.toObject();
    // 🔁 Replace 'delete' with destructuring
    const { password: _, refreshToken: __, ...safeUser } = userObject;

    res.status(200).json({
      success: true,
      data: safeUser,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// REFRESH TOKEN
export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return next(new ApiError(401, 'Refresh token required'));

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as jwt.JwtPayload;
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      return next(new ApiError(403, 'Invalid refresh token'));
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id.toString());
    user.refreshToken = newRefreshToken;
    await user.save();

    res.status(200).json({ accessToken, refreshToken: newRefreshToken });
  } catch (error) {
    next(new ApiError(403, 'Invalid or expired refresh token'));
  }
};