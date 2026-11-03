import { ValidationError, InsufficientStockError } from '../errors/DomainErrors.js';

class Book {
  constructor({
    id = null,
    isbn,
    titulo,
    autor,
    editorial = '',
    anioPublicacion = new Date().getFullYear(),
    precioVenta = 0,
    stockTotal = 0,
    stockDisponible = 0,
    resumen = '',
    creadoEn = new Date().toISOString()
  }) {
    this._id = id;
    this._isbn = this._validateIsbn(isbn);
    this._titulo = this._validateRequired(titulo, 'título');
    this._autor = this._validateRequired(autor, 'autor');
    this._editorial = editorial ? String(editorial).trim() : '';
    this._anioPublicacion = Number(anioPublicacion) || new Date().getFullYear();
    this._precioVenta = this._validatePrecio(precioVenta);
    this._stockTotal = this._validateStock(stockTotal, 'stock total');
    this._stockDisponible = this._validateStock(stockDisponible, 'stock disponible');
    this._resumen = resumen ? String(resumen).trim() : 'Sin resumen o sinopsis disponible para este ejemplar.';

    if (this._stockDisponible > this._stockTotal) {
      throw new ValidationError('El stock disponible no puede superar al stock total.');
    }
    this._creadoEn = creadoEn;
  }

  get id() { return this._id; }
  get isbn() { return this._isbn; }
  get titulo() { return this._titulo; }
  get autor() { return this._autor; }
  get editorial() { return this._editorial; }
  get anioPublicacion() { return this._anioPublicacion; }
  get precioVenta() { return this._precioVenta; }
  get stockTotal() { return this._stockTotal; }
  get stockDisponible() { return this._stockDisponible; }
  get resumen() { return this._resumen; }
  get creadoEn() { return this._creadoEn; }

  canBeLoaned() {
    return this._stockDisponible > 0;
  }

  canBeSold(cantidad = 1) {
    return this._stockDisponible >= cantidad;
  }

  decreaseStockForLoan() {
    if (!this.canBeLoaned()) {
      throw new InsufficientStockError(this._titulo, 1, this._stockDisponible);
    }
    this._stockDisponible -= 1;
  }

  increaseStockOnReturn() {
    if (this._stockDisponible + 1 > this._stockTotal) {
      this._stockDisponible = this._stockTotal;
    } else {
      this._stockDisponible += 1;
    }
  }

  decreaseStockForSale(cantidad = 1) {
    if (!this.canBeSold(cantidad)) {
      throw new InsufficientStockError(this._titulo, cantidad, this._stockDisponible);
    }
    this._stockTotal -= cantidad;
    this._stockDisponible -= cantidad;
  }

  updateDetails({ isbn, titulo, autor, editorial, anioPublicacion, precioVenta, stockTotal, stockDisponible, resumen }) {
    if (isbn !== undefined) this._isbn = this._validateIsbn(isbn);
    if (titulo !== undefined) this._titulo = this._validateRequired(titulo, 'título');
    if (autor !== undefined) this._autor = this._validateRequired(autor, 'autor');
    if (editorial !== undefined) this._editorial = String(editorial).trim();
    if (anioPublicacion !== undefined) this._anioPublicacion = Number(anioPublicacion);
    if (precioVenta !== undefined) this._precioVenta = this._validatePrecio(precioVenta);
    if (resumen !== undefined) this._resumen = String(resumen).trim();
    
    if (stockTotal !== undefined) {
      this._stockTotal = this._validateStock(stockTotal, 'stock total');
    }
    if (stockDisponible !== undefined) {
      this._stockDisponible = this._validateStock(stockDisponible, 'stock disponible');
    }

    if (this._stockDisponible > this._stockTotal) {
      throw new ValidationError('El stock disponible no puede superar al stock total.');
    }
  }

  _validateIsbn(isbn) {
    if (!isbn || typeof isbn !== 'string' || isbn.trim().length < 5) {
      throw new ValidationError('El ISBN es obligatorio y debe tener al menos 5 caracteres.');
    }
    return isbn.trim().toUpperCase();
  }

  _validateRequired(val, field) {
    if (!val || typeof val !== 'string' || val.trim().length === 0) {
      throw new ValidationError(`El campo ${field} es obligatorio.`);
    }
    return val.trim();
  }

  _validatePrecio(p) {
    const num = Number(p);
    if (isNaN(num) || num < 0) {
      throw new ValidationError('El precio de venta debe ser un número mayor o igual a 0.');
    }
    return Math.round(num * 100) / 100;
  }

  _validateStock(s, field) {
    const num = parseInt(s, 10);
    if (isNaN(num) || num < 0) {
      throw new ValidationError(`El ${field} debe ser un entero mayor o igual a 0.`);
    }
    return num;
  }

  toJSON() {
    return {
      id: this._id,
      isbn: this._isbn,
      titulo: this._titulo,
      autor: this._autor,
      editorial: this._editorial,
      anioPublicacion: this._anioPublicacion,
      precioVenta: this._precioVenta,
      stockTotal: this._stockTotal,
      stockDisponible: this._stockDisponible,
      resumen: this._resumen,
      creadoEn: this._creadoEn
    };
  }
}

export default Book;
