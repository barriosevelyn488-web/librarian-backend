class IBookRepository {
  async findById(id) { throw new Error('Method findById() must be implemented.'); }
  async findByIsbn(isbn) { throw new Error('Method findByIsbn() must be implemented.'); }
  async listAll(filters = {}) { throw new Error('Method listAll() must be implemented.'); }
  async create(book) { throw new Error('Method create() must be implemented.'); }
  async update(book) { throw new Error('Method update() must be implemented.'); }
  async delete(id) { throw new Error('Method delete() must be implemented.'); }
  async hasActiveLoansOrSales(id) { throw new Error('Method hasActiveLoansOrSales() must be implemented.'); }
}

export default IBookRepository;
