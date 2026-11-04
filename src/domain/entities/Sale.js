import { ValidationError } from '../errors/DomainErrors.js';
import SaleDetail from './SaleDetail.js';

class Sale {
  constructor({
    id = null,
    usuarioId,
    fechaVenta = new Date().toISOString(),
    total = null,
    metodoPago = 'Tarjeta de Crédito / Débito',
    direccionEnvio = '',
    ciudad = '',
    telefono = '',
    notas = '',
    detalles = [],
    usuarioInfo = null
  }) {
    this._id = id;
    this._usuarioId = this._validateId(usuarioId, 'usuarioId');
    this._fechaVenta = fechaVenta;
    this._metodoPago = metodoPago;
    this._direccionEnvio = direccionEnvio;
    this._ciudad = ciudad;
    this._telefono = telefono;
    this._notas = notas;
    this._detalles = this._initDetalles(detalles);
    this._total = total !== null ? this._validateTotal(total) : this.calculateTotal();
    this._usuarioInfo = usuarioInfo;
  }

  get id() { return this._id; }
  get usuarioId() { return this._usuarioId; }
  get fechaVenta() { return this._fechaVenta; }
  get total() { return this._total; }
  get metodoPago() { return this._metodoPago; }
  get direccionEnvio() { return this._direccionEnvio; }
  get ciudad() { return this._ciudad; }
  get telefono() { return this._telefono; }
  get notas() { return this._notas; }
  get detalles() { return this._detalles; }
  get usuarioInfo() { return this._usuarioInfo; }

  calculateTotal() {
    const sum = this._detalles.reduce((acc, item) => acc + item.subtotal, 0);
    return Math.round(sum * 100) / 100;
  }

  addDetail(detail) {
    if (!(detail instanceof SaleDetail)) {
      throw new ValidationError('El detalle debe ser una instancia de SaleDetail.');
    }
    this._detalles.push(detail);
    this._total = this.calculateTotal();
  }

  _initDetalles(detalles) {
    if (!Array.isArray(detalles) || detalles.length === 0) {
      throw new ValidationError('Una venta debe incluir al menos un producto.');
    }
    return detalles.map(d => (d instanceof SaleDetail ? d : new SaleDetail(d)));
  }

  _validateId(id, field) {
    const num = Number(id);
    if (!id || isNaN(num) || num <= 0) {
      throw new ValidationError(`El campo ${field} es obligatorio.`);
    }
    return num;
  }

  _validateTotal(t) {
    const num = Number(t);
    if (isNaN(num) || num < 0) {
      throw new ValidationError('El total debe ser un número mayor o igual a 0.');
    }
    return Math.round(num * 100) / 100;
  }

  toJSON() {
    return {
      id: this._id,
      usuarioId: this._usuarioId,
      fechaVenta: this._fechaVenta,
      total: this._total,
      metodoPago: this._metodoPago,
      direccionEnvio: this._direccionEnvio,
      ciudad: this._ciudad,
      telefono: this._telefono,
      notas: this._notas,
      detalles: this._detalles.map(d => d.toJSON()),
      usuarioInfo: this._usuarioInfo
    };
  }
}

export default Sale;
