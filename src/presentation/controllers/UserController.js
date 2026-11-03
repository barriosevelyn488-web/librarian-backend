/**
 * UserController
 * Controlador para la gestión de usuarios exclusiva de administradores (POO).
 */
class UserController {
  constructor(userService) {
    this.userService = userService;
    this.getAllUsers = this.getAllUsers.bind(this);
    this.getUserById = this.getUserById.bind(this);
    this.createUser = this.createUser.bind(this);
    this.updateUser = this.updateUser.bind(this);
    this.deleteUser = this.deleteUser.bind(this);
  }

  async getAllUsers(req, res, next) {
    try {
      const users = await this.userService.getAllUsers();
      return res.status(200).json({
        success: true,
        count: users.length,
        data: users
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req, res, next) {
    try {
      const user = await this.userService.getUserById(req.params.id);
      return res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  async createUser(req, res, next) {
    try {
      const created = await this.userService.createUser(req.body);
      return res.status(201).json({
        success: true,
        message: 'Usuario creado exitosamente por el administrador',
        data: created
      });
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req, res, next) {
    try {
      const updated = await this.userService.updateUser(req.params.id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Usuario actualizado exitosamente',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req, res, next) {
    try {
      await this.userService.deleteUser(req.params.id, req.user.id);
      return res.status(200).json({
        success: true,
        message: 'Usuario eliminado exitosamente del sistema'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
