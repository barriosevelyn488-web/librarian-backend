const User = require('../../domain/entities/User');
const { ValidationError, NotFoundError, ConflictError } = require('../../domain/errors/DomainErrors');

/**
 * UserService
 * Servicio de administración de usuarios para el Administrador (CRUD y asignación de roles).
 */
class UserService {
  constructor(userRepository, passwordHasher) {
    this.userRepository = userRepository;
    this.passwordHasher = passwordHasher;
  }

  async getAllUsers() {
    const users = await this.userRepository.listAll();
    return users.map(u => u.toJSON());
  }

  async getUserById(id) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError(`Usuario con ID ${id} no encontrado`);
    }
    return user.toJSON();
  }

  async createUser(userData) {
    const { identificacion, nombre, telefono, direccion, email, password, rol = 'cliente' } = userData;

    if (!identificacion || !nombre || !email || !password) {
      throw new ValidationError('Identificación, nombre, email y contraseña son obligatorios');
    }

    const existingEmail = await this.userRepository.findByEmail(email);
    if (existingEmail) {
      throw new ConflictError('Ya existe un usuario con este correo electrónico');
    }

    const existingId = await this.userRepository.findByIdentificacion(identificacion);
    if (existingId) {
      throw new ConflictError('Ya existe un usuario con esta identificación');
    }

    const passwordHash = await this.passwordHasher.hash(password);
    const user = new User({
      identificacion,
      nombre,
      telefono: telefono || '',
      direccion: direccion || '',
      email,
      passwordHash,
      rol: ['admin', 'cliente'].includes(rol) ? rol : 'cliente'
    });

    const created = await this.userRepository.create(user);
    return created.toJSON();
  }

  async updateUser(id, updateData) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError(`Usuario con ID ${id} no encontrado`);
    }

    if (updateData.email && updateData.email !== user.email) {
      const existing = await this.userRepository.findByEmail(updateData.email);
      if (existing && existing.id !== Number(id)) {
        throw new ConflictError('El correo electrónico ya está en uso por otro usuario');
      }
    }

    let passwordHash = undefined;
    if (updateData.password && updateData.password.trim() !== '') {
      if (updateData.password.length < 6) {
        throw new ValidationError('La contraseña debe tener al menos 6 caracteres');
      }
      passwordHash = await this.passwordHasher.hash(updateData.password);
    }

    user.updateByAdmin({
      nombre: updateData.nombre,
      telefono: updateData.telefono,
      direccion: updateData.direccion,
      email: updateData.email,
      rol: updateData.rol,
      passwordHash
    });

    const updated = await this.userRepository.update(user);
    return updated.toJSON();
  }

  async deleteUser(id, requestingUserId) {
    if (Number(id) === Number(requestingUserId)) {
      throw new ValidationError('Un administrador no puede eliminarse a sí mismo');
    }

    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError(`Usuario con ID ${id} no encontrado`);
    }

    return await this.userRepository.delete(id);
  }
}

module.exports = UserService;
