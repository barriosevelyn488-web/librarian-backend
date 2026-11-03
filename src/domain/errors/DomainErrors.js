export class DomainError extends Error {
  constructor(message, statusCode = 400, code = 'DOMAIN_ERROR') {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends DomainError {
  constructor(message, details = null) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }
}

export class NotFoundError extends DomainError {
  constructor(resource = 'Recurso') {
    super(`${resource} no encontrado.`, 404, 'NOT_FOUND');
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message = 'Acceso no autorizado.') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends DomainError {
  constructor(message = 'Permisos insuficientes.') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class ConflictError extends DomainError {
  constructor(message = 'Conflicto con el recurso.') {
    super(message, 409, 'CONFLICT');
  }
}

export class InsufficientStockError extends DomainError {
  constructor(libroTitulo, solicitado, disponible) {
    super(
      `Stock insuficiente para "${libroTitulo}". Solicitado: ${solicitado}, Disponible: ${disponible}.`,
      409,
      'INSUFFICIENT_STOCK'
    );
  }
}

export class BusinessRuleError extends DomainError {
  constructor(message) {
    super(message, 422, 'BUSINESS_RULE_ERROR');
  }
}

export default DomainError;
