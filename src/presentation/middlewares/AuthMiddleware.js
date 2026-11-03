/**
 * AuthMiddleware
 * Middleware POO para autenticación de peticiones vía Cookie HTTP-Only o cabecera Bearer Token.
 */
class AuthMiddleware {
  constructor(tokenService) {
    this.tokenService = tokenService;
  }

  handle() {
    return (req, res, next) => {
      let token = null;

      // 1. Extraer desde cookies
      if (req.cookies && req.cookies.jwt_token) {
        token = req.cookies.jwt_token;
      }

      // 2. Extraer desde header Authorization Bearer si no está en cookies
      if (!token && req.headers.authorization) {
        const parts = req.headers.authorization.split(' ');
        if (parts.length === 2 && parts[0] === 'Bearer') {
          token = parts[1];
        }
      }

      if (!token) {
        return res.status(401).json({
          success: false,
          error: 'Acceso no autorizado. Debe iniciar sesión para continuar.'
        });
      }

      const decoded = this.tokenService.verifyToken(token);
      if (!decoded) {
        return res.status(401).json({
          success: false,
          error: 'Token inválido o expirado. Inicie sesión nuevamente.'
        });
      }

      req.user = decoded;
      next();
    };
  }
}

export default AuthMiddleware;
