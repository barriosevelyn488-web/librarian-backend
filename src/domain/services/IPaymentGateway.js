/**
 * IPaymentGateway
 * Interfaz / Contrato para estrategias de pasarela de pago (Principio OCP / DIP).
 */
class IPaymentGateway {
  async processPayment(paymentDetails) {
    throw new Error('Método no implementado: processPayment');
  }

  async refundPayment(transactionId, amount) {
    throw new Error('Método no implementado: refundPayment');
  }
}

export default IPaymentGateway;
