import jwt from 'jsonwebtoken';
import { IUser } from '../models/User.model';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

export const generateAccessToken = (user: IUser): string => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    ACCESS_SECRET,
    { expiresIn: '15m' }
  );
};

export const generateRefreshToken = (user: IUser): string => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};

export const verifyAccessToken = (token: string): any => {
  return jwt.verify(token, ACCESS_SECRET);
};

export const verifyRefreshToken = (token: string): any => {
  return jwt.verify(token, REFRESH_SECRET);
};