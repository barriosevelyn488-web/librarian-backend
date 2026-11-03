/**
 * ProfileController
 * Controlador para la administración del perfil personal de usuario (POO).
 */
class ProfileController {
  constructor(profileService) {
    this.profileService = profileService;
    this.getProfile = this.getProfile.bind(this);
    this.updateProfile = this.updateProfile.bind(this);
  }

  async getProfile(req, res, next) {
    try {
      const profile = await this.profileService.getProfile(req.user.id);
      return res.status(200).json({
        success: true,
        data: profile
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const updated = await this.profileService.updateProfile(req.user.id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Perfil actualizado exitosamente',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  }
}

export default ProfileController;
