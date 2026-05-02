const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const MERCADO_PAGO_API = 'https://api.mercadopago.com/v1';

class MercadoPagoService {
  static useMock() {
    const token = process.env.MERCADO_PAGO_TOKEN;
    return !token || token.trim() === '' || token === 'seu_token_aqui' || token === 'seu-token-aqui';
  }

  static async criarPagamento(pedido) {
    if (this.useMock()) {
      console.log('⚠️  MOCK: Pagamento simulado para pedido', pedido.id);
      return {
        success: true,
        paymentId: `mock_${Date.now()}`,
        status: 'pending',
        qrCode: `mock_qr_${pedido.id}`,
      };
    }

    try {
      const TOKEN = process.env.MERCADO_PAGO_TOKEN;
      const response = await axios.post(
        `${MERCADO_PAGO_API}/payments`,
        {
          transaction_amount: pedido.total,
          description: `Pedido #${pedido.id}`,
          payment_method_id: 'pix',
          payer: {
            email: pedido.email || 'cliente@chicogrill.com',
            first_name: pedido.nome_cliente,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return {
        success: true,
        paymentId: response.data.id,
        status: response.data.status,
        qrCode: response.data.point_of_interaction?.transaction_data?.qr_code,
      };
    } catch (error) {
      console.error('Erro MP:', error.response?.data || error.message);
      return { success: false, error: error.response?.data?.message || 'Erro ao criar pagamento' };
    }
  }

  static async obterPagamento(paymentId) {
    if (this.useMock() || String(paymentId).startsWith('mock_')) {
      const createdAt = parseInt(String(paymentId).replace('mock_', '')) || 0;
      const approved = Date.now() - createdAt > 5000;
      console.log(`⚠️  MOCK: pagamento ${approved ? 'aprovado' : 'pendente'}`);
      return {
        success: true,
        status: { status: approved ? 'approved' : 'pending' },
        statusDetail: approved ? 'accredited' : 'waiting_transfer',
      };
    }

    try {
      const TOKEN = process.env.MERCADO_PAGO_TOKEN;
      const response = await axios.get(`${MERCADO_PAGO_API}/payments/${paymentId}`, {
        headers: { Authorization: `Bearer ${TOKEN}` },
      });
      return { success: true, status: response.data.status, statusDetail: response.data.status_detail };
    } catch (error) {
      console.error('Erro MP:', error.message);
      return { success: false, error: 'Erro ao obter status' };
    }
  }

  static async verificarWebhook(data) {
    if (data.type === 'payment') return { paymentId: data.data.id, status: data.action };
    return null;
  }
}

module.exports = MercadoPagoService;