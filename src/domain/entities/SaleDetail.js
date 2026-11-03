import { ValidationError } from '../errors/DomainErrors.js';

class SaleDetail {
  constructor({
    id = null,
    ventaId = null,
    libroId,
    cantidad,
    precioUnitario,
    subtotal = null,
    libroInfo = null
  }) {
    this._id = id;
    this._ventaId = ventaId;
    this._libroId = this._validatePositiveInt(libroId, 'libroId');
    this._cantidad = this._validatePositiveInt(cantidad, 'cantidad');
    this._precioUnitario = this._validateDecimal(precioUnitario, 'precio unitario');
    this._subtotal = subtotal !== null ? this._validateDecimal(subtotal, 'subtotal') : this._calculateSubtotal();
    this._libroInfo = libroInfo;
  }

  get id() { return this._id; }
  get ventaId() { return this._ventaId; }
  get libroId() { return this._libroId; }
  get cantidad() { return this._cantidad; }
  get precioUnitario() { return this._precioUnitario; }
  get subtotal() { return this._subtotal; }
  get libroInfo() { return this._libroInfo; }

  setVentaId(id) {
    this._ventaId = this._validatePositiveInt(id, 'ventaId');
  }

  _calculateSubtotal() {
    return Math.round(this._cantidad * this._precioUnitario * 100) / 100;
  }

  _validatePositiveInt(val, field) {
    const num = parseInt(val, 10);
    if (isNaN(num) || num <= 0) {
      throw new ValidationError(`El campo ${field} debe ser un número entero positivo.`);
    }
    return num;
  }

  _validateDecimal(val, field) {
    const num = Number(val);
    if (isNaN(num) || num < 0) {
      throw new ValidationError(`El campo ${field} debe ser mayor o igual a 0.`);
    }
    return Math.round(num * 100) / 100;
  }

  toJSON() {
    return {
      id: this._id,
      ventaId: this._ventaId,
      libroId: this._libroId,
      cantidad: this._cantidad,
      precioUnitario: this._precioUnitario,
      subtotal: this._subtotal,
      libroInfo: this._libroInfo
    };
  }
}

export default SaleDetail;
