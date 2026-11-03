const { ValidationError, NotFoundError, ConflictError } = require('../../domain/errors/DomainErrors');

/**
 * ProfileService
 * Gestión del perfil de usuario asegurando inmutabilidad estricta del número de identificación.
 */
class ProfileService {
  constructor(userRepository, passwordHasher) {
    this.userRepository = userRepository;
    this.passwordHasher = passwordHasher;
  }

  async getProfile(userId) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError(`Usuario no encontrado`);
    }
    return user.toJSON();
  }

  async updateProfile(userId, data) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError(`Usuario no encontrado`);
    }

    if (data.email && data.email !== user.email) {
      const existing = await this.userRepository.findByEmail(data.email);
      if (existing && existing.id !== Number(userId)) {
        throw new ConflictError('El correo electrónico ya está registrado por otro usuario');
      }
    }

    let passwordHash = undefined;
    if (data.password && data.password.trim() !== '') {
      if (data.password.length < 6) {
        throw new ValidationError('La nueva contraseña debe tener al menos 6 caracteres');
      }
      passwordHash = await this.passwordHasher.hash(data.password);
    }

    // Regla de Negocio: No se permite cambiar la identificación
    user.updateProfile({
      nombre: data.nombre,
      telefono: data.telefono,
      direccion: data.direccion,
      email: data.email,
      passwordHash
    });

    const updated = await this.userRepository.update(user);
    return updated.toJSON();
  }
}

module.exports = ProfileService;
