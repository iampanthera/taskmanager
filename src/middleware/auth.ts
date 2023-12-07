import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { JWT_SECRET } from '../utils/secrets';

interface AuthenticatedRequest extends Request {
  userId?: string;
}
export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized access' });
    }

    const { userId } = jwt.verify(token, JWT_SECRET) as JwtPayload;

    // @ts-ignore
    req.userId = userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
