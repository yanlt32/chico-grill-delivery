const express = require('express');
const router = express.Router();
const Pedido = require('../models/Pedido');

function notificar(req, pedidoId, status) {
  try {
    const fn = req.app.locals.notificarMudancaPedido;
    if (fn) fn(pedidoId, status);
  } catch(e) {}
}

// POST - Criar pedido
router.post('/', async (req, res) => {
  try {
    const { nome_cliente, endereco, telefone, cpf, itens, forma_pagamento, troco_para } = req.body;
    if (!nome_cliente || !endereco || !cpf || !itens || itens.length === 0)
      return res.status(400).json({ error: 'Nome, endereço, CPF e itens são obrigatórios' });

    const total = itens.reduce((sum, item) => sum + item.preco * item.quantidade, 0);
    const pedido = await Pedido.criar({ nome_cliente, endereco, telefone, cpf, total, forma_pagamento, troco_para });
    await Pedido.adicionarItens(pedido.id, itens);

    // Cartão/Dinheiro já vão direto como pago
    if (forma_pagamento === 'dinheiro' || forma_pagamento === 'cartao') {
      await Pedido.atualizarStatus(pedido.id, 'pago');
      notificar(req, pedido.id, 'pago');
    }

    const pedidoCompleto = await Pedido.obterComItens(pedido.id);
    res.status(201).json({ success: true, pedido: pedidoCompleto });
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    res.status(500).json({ error: 'Erro ao criar pedido' });
  }
});

// GET - Todos
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const pedidos = await Pedido.obterTodos({ status });
    res.json({ success: true, pedidos });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter pedidos' });
  }
});

// GET - Por ID
router.get('/:id', async (req, res) => {
  try {
    const pedido = await Pedido.obterComItens(req.params.id);
    if (!pedido) return res.status(404).json({ error: 'Pedido não encontrado' });
    res.json({ success: true, pedido });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter pedido' });
  }
});

// PUT - Atualizar avaliação
router.put('/:id/avaliacao', async (req, res) => {
  try {
    const { estrela, comentario } = req.body;
    if (!estrela || estrela < 1 || estrela > 5)
      return res.status(400).json({ error: 'Avaliação em estrelas é obrigatória e deve ser entre 1 e 5' });

    const pedido = await Pedido.atualizarAvaliacao(req.params.id, estrela, comentario);
    res.json({ success: true, pedido });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao registrar avaliação' });
  }
});

// PUT - Atualizar status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'Status é obrigatório' });
    const pedido = await Pedido.atualizarStatus(req.params.id, status);
    notificar(req, req.params.id, status);
    res.json({ success: true, pedido });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar status' });
  }
});

module.exports = router;