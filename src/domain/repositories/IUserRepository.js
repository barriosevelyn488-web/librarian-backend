class IUserRepository {
  async findById(id) { throw new Error('Method findById() must be implemented.'); }
  async findByEmail(email) { throw new Error('Method findByEmail() must be implemented.'); }
  async findByIdentificacion(identificacion) { throw new Error('Method findByIdentificacion() must be implemented.'); }
  async create(user) { throw new Error('Method create() must be implemented.'); }
  async update(user) { throw new Error('Method update() must be implemented.'); }
  async delete(id) { throw new Error('Method delete() must be implemented.'); }
  async listAll(filters = {}) { throw new Error('Method listAll() must be implemented.'); }
  async hasActiveLoansOrPurchases(id) { throw new Error('Method hasActiveLoansOrPurchases() must be implemented.'); }
}

export default IUserRepository;
