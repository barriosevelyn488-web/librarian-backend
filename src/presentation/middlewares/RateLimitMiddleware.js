import rateLimit from 'express-rate-limit';

/**
 * RateLimitMiddleware
 * Clase POO para configuración y aplicación de rate limiting para proteger contra ataques de fuerza bruta y DoS.
 */
class RateLimitMiddleware {
  constructor(windowMs = 15 * 60 * 1000, maxRequests = 100, message = 'Demasiadas solicitudes desde esta IP, por favor intente nuevamente en 15 minutos.') {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.message = message;
  }

  handle() {
    return rateLimit({
      windowMs: this.windowMs,
      max: this.maxRequests,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        error: this.message
      }
    });
  }

  static createAuthLimiter() {
    return new RateLimitMiddleware(
      15 * 60 * 1000,
      15, // 15 intentos en 15 minutos para login/registro
      'Demasiados intentos de autenticación. Por favor intente más tarde.'
    ).handle();
  }

  static createApiLimiter() {
    return new RateLimitMiddleware(
      15 * 60 * 1000,
      200,
      'Límite de solicitudes de API excedido.'
    ).handle();
  }
}

export default RateLimitMiddleware;
