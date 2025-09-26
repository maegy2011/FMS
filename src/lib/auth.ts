import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface DecodedToken {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export function verifyToken(token: string): DecodedToken | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    return decoded;
  } catch (error) {
    return null;
  }
}

export function getTokenFromHeaders(headers: Headers): string | null {
  const authHeader = headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

export function requireAuth(headers: Headers): DecodedToken {
  const token = getTokenFromHeaders(headers);
  if (!token) {
    throw new Error('غير مصرح بالوصول');
  }
  
  const decoded = verifyToken(token);
  if (!decoded) {
    throw new Error('رمز المصادقة غير صالح');
  }
  
  return decoded;
}

export function requireRole(headers: Headers, requiredRole: string): DecodedToken {
  const decoded = requireAuth(headers);
  if (decoded.role !== requiredRole) {
    throw new Error('غير مصرح بالوصول');
  }
  return decoded;
}