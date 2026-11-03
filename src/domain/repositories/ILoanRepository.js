class ILoanRepository {
  async findById(id) { throw new Error('Method findById() must be implemented.'); }
  async create(loan) { throw new Error('Method create() must be implemented.'); }
  async update(loan) { throw new Error('Method update() must be implemented.'); }
  async listAll(filters = {}) { throw new Error('Method listAll() must be implemented.'); }
  async findByUserId(usuarioId) { throw new Error('Method findByUserId() must be implemented.'); }
  async countActiveByBookId(libroId) { throw new Error('Method countActiveByBookId() must be implemented.'); }
  async getMetrics() { throw new Error('Method getMetrics() must be implemented.'); }
}

module.exports = ILoanRepository;
