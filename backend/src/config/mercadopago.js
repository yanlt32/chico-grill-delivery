const axios = require('axios');
require('dotenv').config();

const MERCADO_PAGO_API = 'https://api.mercadopago.com/v1';
const TOKEN = process.env.MERCADO_PAGO_TOKEN;
const USE_MOCK = !TOKEN || TOKEN === 'seu-token-aqui';

class MercadoPagoService {
  static async criarPagamento(pedido) {
    // ===== MOCK (sem token configurado) =====
    if (USE_MOCK) {
      console.log('⚠️  Mercado Pago em modo MOCK - usando pagamento simulado');
      const fakePaymentId = `mock_${Date.now()}`;
      return {
        success: true,
        paymentId: fakePaymentId,
        status: 'pending',
        qrCode: `https://chico-grill.vercel.app/?pedido=${pedido.id}`, // QR fake
      };
    }

    // ===== PRODUÇÃO (com token real) =====
    try {
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
      console.error('Erro ao criar pagamento:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao criar pagamento',
      };
    }
  }

  static async obterPagamento(paymentId) {
    // ===== MOCK =====
    if (USE_MOCK || String(paymentId).startsWith('mock_')) {
      console.log('⚠️  Verificando pagamento em modo MOCK');
      // Simula aprovação automática após 5 segundos do mock criado
      const createdAt = parseInt(String(paymentId).replace('mock_', '')) || 0;
      const elapsed = Date.now() - createdAt;
      const approved = elapsed > 5000; // aprova depois de 5s

      return {
        success: true,
        status: { status: approved ? 'approved' : 'pending' },
        statusDetail: approved ? 'accredited' : 'waiting_transfer',
      };
    }

    // ===== PRODUÇÃO =====
    try {
      const response = await axios.get(
        `${MERCADO_PAGO_API}/payments/${paymentId}`,
        {
          headers: { Authorization: `Bearer ${TOKEN}` },
        }
      );

      return {
        success: true,
        status: response.data.status,
        statusDetail: response.data.status_detail,
      };
    } catch (error) {
      console.error('Erro ao obter pagamento:', error.message);
      return {
        success: false,
        error: 'Erro ao obter status do pagamento',
      };
    }
  }

  static async verificarWebhook(data) {
    if (data.type === 'payment') {
      return {
        paymentId: data.data.id,
        status: data.action,
      };
    }
    return null;
  }
}

module.exports = MercadoPagoService;