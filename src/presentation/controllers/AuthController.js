/**
 * AuthController
 * Controlador para autenticación y manejo de sesión (POO pura).
 */
class AuthController {
  constructor(authService) {
    this.authService = authService;
    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.me = this.me.bind(this);
  }

  async register(req, res, next) {
    try {
      const result = await this.authService.register(req.body);

      // Guardar token en Cookie HTTP-Only para máxima seguridad en navegadores
      res.cookie('jwt_token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 horas
      });

      return res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: result.user,
        token: result.token
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await this.authService.login(email, password);

      // Guardar token en Cookie HTTP-Only
      res.cookie('jwt_token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 horas
      });

      return res.status(200).json({
        success: true,
        message: 'Inicio de sesión exitoso',
        data: result.user,
        token: result.token
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res) {
    res.clearCookie('jwt_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    return res.status(200).json({
      success: true,
      message: 'Sesión cerrada exitosamente'
    });
  }

  async me(req, res) {
    return res.status(200).json({
      success: true,
      data: req.user
    });
  }
}

module.exports = AuthController;
