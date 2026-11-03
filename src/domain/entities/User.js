const { ValidationError } = require('../errors/DomainErrors');

class User {
  constructor({
    id = null,
    identificacion,
    nombre,
    telefono = '',
    direccion = '',
    email,
    passwordHash = '',
    rol = 'cliente',
    creadoEn = new Date().toISOString()
  }) {
    this._id = id;
    this._identificacion = this._validateIdentificacion(identificacion);
    this._nombre = this._validateNombre(nombre);
    this._telefono = telefono ? String(telefono).trim() : '';
    this._direccion = direccion ? String(direccion).trim() : '';
    this._email = this._validateEmail(email);
    this._passwordHash = passwordHash;
    this._rol = this._validateRol(rol);
    this._creadoEn = creadoEn;
  }

  get id() { return this._id; }
  get identificacion() { return this._identificacion; }
  get nombre() { return this._nombre; }
  get telefono() { return this._telefono; }
  get direccion() { return this._direccion; }
  get email() { return this._email; }
  get passwordHash() { return this._passwordHash; }
  get rol() { return this._rol; }
  get creadoEn() { return this._creadoEn; }

  isAdmin() {
    return this._rol === 'admin';
  }

  isClient() {
    return this._rol === 'cliente';
  }

  updateProfile({ nombre, telefono, direccion, email }) {
    if (nombre !== undefined) this._nombre = this._validateNombre(nombre);
    if (telefono !== undefined) this._telefono = String(telefono).trim();
    if (direccion !== undefined) this._direccion = String(direccion).trim();
    if (email !== undefined) this._email = this._validateEmail(email);
  }

  updateByAdmin({ nombre, telefono, direccion, email, rol, identificacion, passwordHash }) {
    if (nombre !== undefined) this._nombre = this._validateNombre(nombre);
    if (telefono !== undefined) this._telefono = String(telefono).trim();
    if (direccion !== undefined) this._direccion = String(direccion).trim();
    if (email !== undefined) this._email = this._validateEmail(email);
    if (rol !== undefined) this._rol = this._validateRol(rol);
    if (identificacion !== undefined) this._identificacion = this._validateIdentificacion(identificacion);
    if (passwordHash) this._passwordHash = passwordHash;
  }

  attemptChangeIdentificacion(newId) {
    if (newId && newId !== this._identificacion) {
      throw new ValidationError('Política de Seguridad: El número de identificación del usuario no puede ser modificado.');
    }
  }

  _validateIdentificacion(id) {
    if (!id || typeof id !== 'string' || id.trim().length < 3) {
      throw new ValidationError('La identificación es obligatoria y debe contener al menos 3 caracteres.');
    }
    return id.trim();
  }

  _validateNombre(name) {
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      throw new ValidationError('El nombre es obligatorio y debe tener al menos 2 caracteres.');
    }
    return name.trim();
  }

  _validateEmail(email) {
    if (!email || typeof email !== 'string') {
      throw new ValidationError('El correo electrónico es obligatorio.');
    }
    const clean = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(clean)) {
      throw new ValidationError('El formato del correo electrónico no es válido.');
    }
    return clean;
  }

  _validateRol(rol) {
    const validRoles = ['admin', 'cliente'];
    if (!validRoles.includes(rol)) {
      throw new ValidationError(`Rol "${rol}" inválido. Debe ser "admin" o "cliente".`);
    }
    return rol;
  }

  toJSON() {
    return {
      id: this._id,
      identificacion: this._identificacion,
      nombre: this._nombre,
      telefono: this._telefono,
      direccion: this._direccion,
      email: this._email,
      rol: this._rol,
      creadoEn: this._creadoEn
    };
  }
}

module.exports = User;
