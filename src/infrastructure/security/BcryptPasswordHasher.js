const bcrypt = require('bcryptjs');

/**
 * BcryptPasswordHasher
 * Implementación de hashing de contraseñas bajo POO.
 */
class BcryptPasswordHasher {
  constructor(saltRounds = 10) {
    this.saltRounds = saltRounds;
  }

  async hash(plainPassword) {
    if (!plainPassword) {
      throw new Error('La contraseña no puede estar vacía');
    }
    return await bcrypt.hash(plainPassword, this.saltRounds);
  }

  async compare(plainPassword, hashedPassword) {
    if (!plainPassword || !hashedPassword) {
      return false;
    }
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = BcryptPasswordHasher;
