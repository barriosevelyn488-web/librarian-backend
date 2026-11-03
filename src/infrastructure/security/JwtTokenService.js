import jwt from 'jsonwebtoken';

/**
 * JwtTokenService
 * Implementación de generación y verificación de JWT bajo POO.
 */
class JwtTokenService {
  constructor(secretKey = process.env.JWT_SECRET || 'acme_super_secure_jwt_secret_key_2026', expiresIn = process.env.JWT_EXPIRES_IN || '24h') {
    this.secretKey = secretKey;
    this.expiresIn = expiresIn;
  }

  generateToken(payload) {
    return jwt.sign(payload, this.secretKey, { expiresIn: this.expiresIn });
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, this.secretKey);
    } catch (error) {
      return null;
    }
  }
}

export default JwtTokenService;
