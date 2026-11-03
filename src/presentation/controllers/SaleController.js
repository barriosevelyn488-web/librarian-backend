/**
 * SaleController
 * Controlador para operaciones de ventas y facturación de libros (POO).
 */
class SaleController {
  constructor(saleService) {
    this.saleService = saleService;
    this.processSale = this.processSale.bind(this);
    this.getAllSales = this.getAllSales.bind(this);
    this.getMySales = this.getMySales.bind(this);
    this.getSaleById = this.getSaleById.bind(this);
  }

  async processSale(req, res, next) {
    try {
      const usuarioId = req.user.rol === 'admin' && req.body.usuarioId ? req.body.usuarioId : req.user.id;

      const sale = await this.saleService.processSale({
        usuarioId,
        items: req.body.items,
        paymentMethod: req.body.paymentMethod || 'tarjeta_paypal'
      });

      return res.status(201).json({
        success: true,
        message: 'Compra procesada y registrada exitosamente',
        data: sale
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllSales(req, res, next) {
    try {
      const sales = await this.saleService.getAllSales();
      return res.status(200).json({
        success: true,
        count: sales.length,
        data: sales.map(s => s.toJSON())
      });
    } catch (error) {
      next(error);
    }
  }

  async getMySales(req, res, next) {
    try {
      const sales = await this.saleService.getSalesByUser(req.user.id);
      return res.status(200).json({
        success: true,
        count: sales.length,
        data: sales.map(s => s.toJSON())
      });
    } catch (error) {
      next(error);
    }
  }

  async getSaleById(req, res, next) {
    try {
      const sale = await this.saleService.getSaleById(req.params.id);

      // Si no es admin y la venta no le pertenece, no puede verla
      if (req.user.rol !== 'admin' && sale.usuarioId !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'No tiene autorización para visualizar este comprobante de venta'
        });
      }

      return res.status(200).json({
        success: true,
        data: sale.toJSON()
      });
    } catch (error) {
      next(error);
    }
  }
}

export default SaleController;
