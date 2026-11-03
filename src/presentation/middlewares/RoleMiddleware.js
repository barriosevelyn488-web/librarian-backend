/**
 * RoleMiddleware
 * Control de acceso basado en roles (RBAC) en POO.
 */
class RoleMiddleware {
  constructor(allowedRoles = []) {
    this.allowedRoles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  }

  handle() {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Usuario no autenticado'
        });
      }

      if (!this.allowedRoles.includes(req.user.rol)) {
        return res.status(403).json({
          success: false,
          error: `Acceso denegado. Se requiere uno de los siguientes roles: ${this.allowedRoles.join(', ')}`
        });
      }

      next();
    };
  }
}

export default RoleMiddleware;
