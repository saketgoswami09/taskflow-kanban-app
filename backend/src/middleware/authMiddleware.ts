import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// We need to add a 'user' property to the Express Request type
// This is a common practice in TypeScript with Express
export interface AuthRequest extends Request {
  user?: { userId: string };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  // 1. Get the token from the cookies
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided.' });
  }

  try {
    // 2. Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    
    // 3. Attach user info to the request object
    req.user = decoded;
    
    // 4. Call 'next()' to pass the request to the next handler
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token.' });
  }
};