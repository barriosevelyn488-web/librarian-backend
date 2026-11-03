const User = require('../../domain/entities/User');
const { ValidationError, UnauthorizedError, ConflictError } = require('../../domain/errors/DomainErrors');

/**
 * AuthService
 * Servicio de aplicación para registro, login y gestión de sesión (POO pura).
 */
class AuthService {
  constructor(userRepository, passwordHasher, tokenService) {
    this.userRepository = userRepository;
    this.passwordHasher = passwordHasher;
    this.tokenService = tokenService;
  }

  async register(userData) {
    const { identificacion, nombre, telefono, direccion, email, password } = userData;

    if (!identificacion || !nombre || !email || !password) {
      throw new ValidationError('Todos los campos obligatorios deben ser provistos');
    }

    const existingEmail = await this.userRepository.findByEmail(email);
    if (existingEmail) {
      throw new ConflictError('Ya existe un usuario con este correo electrónico');
    }

    const existingId = await this.userRepository.findByIdentificacion(identificacion);
    if (existingId) {
      throw new ConflictError('Ya existe un usuario con este número de identificación');
    }

    const passwordHash = await this.passwordHasher.hash(password);
    const newUser = new User({
      identificacion,
      nombre,
      telefono: telefono || '',
      direccion: direccion || '',
      email,
      passwordHash,
      rol: 'cliente'
    });

    const created = await this.userRepository.create(newUser);
    const token = this.tokenService.generateToken({
      id: created.id,
      email: created.email,
      rol: created.rol,
      nombre: created.nombre
    });

    return {
      user: created.toJSON(),
      token
    };
  }

  async login(email, password) {
    if (!email || !password) {
      throw new ValidationError('Email y contraseña son requeridos');
    }

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    const isValid = await this.passwordHasher.compare(password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    const token = this.tokenService.generateToken({
      id: user.id,
      email: user.email,
      rol: user.rol,
      nombre: user.nombre
    });

    return {
      user: user.toJSON(),
      token
    };
  }
}

module.exports = AuthService;
