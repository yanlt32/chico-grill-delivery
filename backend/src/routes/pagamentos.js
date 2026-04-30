const express = require('express');
const router = express.Router();
const MercadoPagoService = require('../config/mercadopago');
const Pedido = require('../models/Pedido');

// POST - Criar pagamento via Mercado Pago
router.post('/', async (req, res) => {
  try {
    const { pedido_id } = req.body;

    if (!pedido_id) {
      return res.status(400).json({
        error: 'Pedido ID é obrigatório',
      });
    }

    // Obter pedido
    const pedido = await Pedido.obterPorId(pedido_id);

    if (!pedido) {
      return res.status(404).json({
        error: 'Pedido não encontrado',
      });
    }

    // Criar pagamento
    const pagamento = await MercadoPagoService.criarPagamento({
      id: pedido.id,
      nome_cliente: pedido.nome_cliente,
      total: pedido.total,
      email: 'cliente@chicogrill.com',
    });

    if (!pagamento.success) {
      return res.status(400).json({
        error: pagamento.error,
      });
    }

    // Salvar payment_id no pedido
    await Pedido.atualizarPagamento(pedido_id, pagamento.paymentId, 'aguardando');

    res.json({
      success: true,
      payment: pagamento,
    });
  } catch (error) {
    console.error('Erro ao criar pagamento:', error);
    res.status(500).json({
      error: 'Erro ao criar pagamento',
    });
  }
});

// GET - Verificar status do pagamento
router.get('/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;

    const status = await MercadoPagoService.obterPagamento(paymentId);

    if (!status.success) {
      return res.status(400).json({
        error: status.error,
      });
    }

    res.json({
      success: true,
      status,
    });
  } catch (error) {
    console.error('Erro ao verificar pagamento:', error);
    res.status(500).json({
      error: 'Erro ao verificar pagamento',
    });
  }
});

// POST - Webhook Mercado Pago
router.post('/webhook', async (req, res) => {
  try {
    const { data, type, action } = req.body;

    if (type === 'payment') {
      // Atualizar status do pagamento no banco
      if (action === 'payment.approved') {
        // Atualizar pedido para "pago"
        // Aqui você precisaria encontrar o pedido pelo payment_id
        console.log('✅ Pagamento aprovado:', data.id);
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    res.status(500).json({
      error: 'Erro ao processar webhook',
    });
  }
});

module.exports = router;
