class ISaleRepository {
  async findById(id) { throw new Error('Method findById() must be implemented.'); }
  async create(sale) { throw new Error('Method create() must be implemented.'); }
  async listAll() { throw new Error('Method listAll() must be implemented.'); }
  async findByUserId(usuarioId) { throw new Error('Method findByUserId() must be implemented.'); }
  async countByBookId(libroId) { throw new Error('Method countByBookId() must be implemented.'); }
  async getMetrics() { throw new Error('Method getMetrics() must be implemented.'); }
}

export default ISaleRepository;
