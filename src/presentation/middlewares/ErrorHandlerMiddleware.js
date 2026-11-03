const {
  ValidationError,
  NotFoundError,
  ConflictError,
  UnauthorizedError,
  ForbiddenError,
  BusinessRuleError
} = require('../../domain/errors/DomainErrors');

/**
 * ErrorHandlerMiddleware
 * Manejador centralizado de errores en POO con mapeo de errores de dominio a códigos HTTP.
 */
class ErrorHandlerMiddleware {
  handle() {
    return (err, req, res, next) => {
      // Log para auditoría
      if (process.env.NODE_ENV !== 'test') {
        console.error(`[Error] ${err.name || 'Error'}: ${err.message}`);
      }

      if (err instanceof ValidationError) {
        return res.status(400).json({
          success: false,
          error: err.message,
          type: 'VALIDATION_ERROR'
        });
      }

      if (err instanceof UnauthorizedError) {
        return res.status(401).json({
          success: false,
          error: err.message,
          type: 'UNAUTHORIZED'
        });
      }

      if (err instanceof ForbiddenError) {
        return res.status(403).json({
          success: false,
          error: err.message,
          type: 'FORBIDDEN'
        });
      }

      if (err instanceof NotFoundError) {
        return res.status(404).json({
          success: false,
          error: err.message,
          type: 'NOT_FOUND'
        });
      }

      if (err instanceof ConflictError) {
        return res.status(409).json({
          success: false,
          error: err.message,
          type: 'CONFLICT'
        });
      }

      if (err instanceof BusinessRuleError) {
        return res.status(422).json({
          success: false,
          error: err.message,
          type: 'BUSINESS_RULE_VIOLATION'
        });
      }

      // Error interno del servidor no controlado
      return res.status(500).json({
        success: false,
        error: 'Ocurrió un error interno en el servidor',
        type: 'INTERNAL_SERVER_ERROR'
      });
    };
  }
}

module.exports = ErrorHandlerMiddleware;
