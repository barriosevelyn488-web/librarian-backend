const { ValidationError } = require('../errors/DomainErrors');

class Loan {
  constructor({
    id = null,
    usuarioId,
    libroId,
    fechaPrestamo,
    fechaTentativaDevolucion,
    fechaDevolucionReal = null,
    estado = 'activo',
    notas = ''
  }) {
    this._id = id;
    this._usuarioId = this._validateId(usuarioId, 'usuarioId');
    this._libroId = this._validateId(libroId, 'libroId');
    this._fechaPrestamo = this._validateFecha(fechaPrestamo, 'fecha de préstamo');
    this._fechaTentativaDevolucion = this._validateFecha(fechaTentativaDevolucion, 'fecha tentativa de devolución');

    if (new Date(this._fechaTentativaDevolucion) < new Date(this._fechaPrestamo)) {
      throw new ValidationError('La fecha tentativa de devolución no puede ser anterior a la fecha de préstamo.');
    }

    this._fechaDevolucionReal = fechaDevolucionReal ? this._validateFecha(fechaDevolucionReal, 'fecha de devolución real') : null;
    this._estado = this._validateEstado(estado);
    this._notas = notas ? String(notas).trim() : '';

    this._syncEstado();
  }

  get id() { return this._id; }
  get usuarioId() { return this._usuarioId; }
  get libroId() { return this._libroId; }
  get fechaPrestamo() { return this._fechaPrestamo; }
  get fechaTentativaDevolucion() { return this._fechaTentativaDevolucion; }
  get fechaDevolucionReal() { return this._fechaDevolucionReal; }
  get estado() { return this._estado; }
  get notas() { return this._notas; }

  isDelayed() {
    if (this._estado === 'devuelto') return false;
    const hoy = new Date().toISOString().split('T')[0];
    return hoy > this._fechaTentativaDevolucion;
  }

  markAsReturned(fecha = new Date().toISOString().split('T')[0]) {
    if (this._estado === 'devuelto') {
      throw new ValidationError('El préstamo ya se encuentra marcado como devuelto.');
    }
    this._fechaDevolucionReal = this._validateFecha(fecha, 'fecha de devolución');
    this._estado = 'devuelto';
  }

  _syncEstado() {
    if (this._estado !== 'devuelto' && this.isDelayed()) {
      this._estado = 'retrasado';
    }
  }

  _validateId(id, field) {
    const num = Number(id);
    if (!id || isNaN(num) || num <= 0) {
      throw new ValidationError(`El campo ${field} es obligatorio.`);
    }
    return num;
  }

  _validateFecha(fecha, field) {
    if (!fecha || typeof fecha !== 'string') {
      throw new ValidationError(`El campo ${field} es obligatorio.`);
    }
    const d = new Date(fecha);
    if (isNaN(d.getTime())) {
      throw new ValidationError(`El formato de ${field} no es válido.`);
    }
    return fecha.split('T')[0];
  }

  _validateEstado(estado) {
    const valid = ['activo', 'devuelto', 'retrasado'];
    if (!valid.includes(estado)) {
      throw new ValidationError(`Estado "${estado}" inválido. Debe ser: ${valid.join(', ')}.`);
    }
    return estado;
  }

  toJSON() {
    return {
      id: this._id,
      usuarioId: this._usuarioId,
      libroId: this._libroId,
      fechaPrestamo: this._fechaPrestamo,
      fechaTentativaDevolucion: this._fechaTentativaDevolucion,
      fechaDevolucionReal: this._fechaDevolucionReal,
      estado: this._estado,
      notas: this._notas,
      isDelayed: this.isDelayed()
    };
  }
}

module.exports = Loan;
