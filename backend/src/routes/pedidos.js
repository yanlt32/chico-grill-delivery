const express = require('express');
const router = express.Router();
const Pedido = require('../models/Pedido');
const MercadoPagoService = require('../config/mercadopago');

// POST - Criar novo pedido
router.post('/', async (req, res) => {
  try {
    const { nome_cliente, endereco, telefone, itens } = req.body;

    // Validar dados obrigatórios
    if (!nome_cliente || !endereco || !itens || itens.length === 0) {
      return res.status(400).json({
        error: 'Nome, endereço e itens são obrigatórios',
      });
    }

    // Calcular total
    const total = itens.reduce((sum, item) => sum + item.preco * item.quantidade, 0);

    // Criar pedido
    const pedido = await Pedido.criar({
      nome_cliente,
      endereco,
      telefone,
      total,
    });

    // Adicionar itens
    await Pedido.adicionarItens(pedido.id, itens);

    // Obter pedido com itens
    const pedidoCompleto = await Pedido.obterComItens(pedido.id);

    res.status(201).json({
      success: true,
      pedido: pedidoCompleto,
    });
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    res.status(500).json({
      error: 'Erro ao criar pedido',
    });
  }
});

// GET - Obter todos os pedidos
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const pedidos = await Pedido.obterTodos({ status });

    res.json({
      success: true,
      pedidos,
    });
  } catch (error) {
    console.error('Erro ao obter pedidos:', error);
    res.status(500).json({
      error: 'Erro ao obter pedidos',
    });
  }
});

// GET - Obter pedido por ID
router.get('/:id', async (req, res) => {
  try {
    const pedido = await Pedido.obterComItens(req.params.id);

    if (!pedido) {
      return res.status(404).json({
        error: 'Pedido não encontrado',
      });
    }

    res.json({
      success: true,
      pedido,
    });
  } catch (error) {
    console.error('Erro ao obter pedido:', error);
    res.status(500).json({
      error: 'Erro ao obter pedido',
    });
  }
});

// PUT - Atualizar status do pedido
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        error: 'Status é obrigatório',
      });
    }

    const pedido = await Pedido.atualizarStatus(req.params.id, status);

    res.json({
      success: true,
      pedido,
    });
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({
      error: 'Erro ao atualizar status',
    });
  }
});

module.exports = router;
