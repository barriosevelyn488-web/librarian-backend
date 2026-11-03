import IPaymentGateway from '../../domain/services/IPaymentGateway.js';

/**
 * PayPalPaymentGateway
 * Implementación de la pasarela de pagos simulando / integrando PayPal sandbox.
 */
class PayPalPaymentGateway extends IPaymentGateway {
  constructor(clientId = process.env.PAYPAL_CLIENT_ID || 'sandbox_client_id', clientSecret = process.env.PAYPAL_CLIENT_SECRET || 'sandbox_secret') {
    super();
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  async processPayment(paymentDetails) {
    const { amount, currency = 'USD', customerEmail, description } = paymentDetails;

    if (!amount || amount <= 0) {
      return {
        success: false,
        error: 'El monto a procesar debe ser mayor a cero'
      };
    }

    // Simulación de transacción procesada exitosamente con ID único
    const transactionId = `PAYPAL-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

    return {
      success: true,
      transactionId,
      amount,
      currency,
      customerEmail,
      description,
      status: 'COMPLETED',
      provider: 'PayPal',
      processedAt: new Date().toISOString()
    };
  }

  async refundPayment(transactionId, amount) {
    return {
      success: true,
      refundId: `REFUND-${Date.now()}`,
      originalTransactionId: transactionId,
      amount,
      status: 'REFUNDED',
      refundedAt: new Date().toISOString()
    };
  }
}

export default PayPalPaymentGateway;
