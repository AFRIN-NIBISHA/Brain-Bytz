import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'brainbytz_super_secure_jwt_secret_key_2026';

export function generateAdminToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' });
}

export function generateAttemptToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '3h' });
}

export function verifyAdminToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Admin authentication token required.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded || decoded.role !== 'admin' && decoded.role !== 'superadmin') {
      return res.status(403).json({ error: 'Forbidden: Insufficient privileges.' });
    }
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired admin session token.' });
  }
}

export function verifyAttemptToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Quiz attempt token required.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.attempt = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired quiz session token.' });
  }
}
