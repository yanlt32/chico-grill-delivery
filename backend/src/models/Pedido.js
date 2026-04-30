const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');

class Pedido {
  static async criar(dados) {
    const id = uuidv4();
    
    try {
      if (db.USE_MEMORY) {
        const pedido = {
          id,
          nome_cliente: dados.nome_cliente,
          endereco: dados.endereco,
          telefone: dados.telefone,
          status: 'aguardando_pagamento',
          total: dados.total,
          payment_id: null,
          payment_status: null,
          created_at: new Date(),
          updated_at: new Date(),
        };
        db.memoryData.pedidos.push(pedido);
        return pedido;
      }

      const result = await db.query(
        `INSERT INTO pedidos (id, nome_cliente, endereco, telefone, total)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [id, dados.nome_cliente, dados.endereco, dados.telefone, dados.total]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      throw error;
    }
  }

  static async obterPorId(id) {
    try {
      if (db.USE_MEMORY) {
        return db.memoryData.pedidos.find(p => p.id === id);
      }

      const result = await db.query(
        'SELECT * FROM pedidos WHERE id = $1',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Erro ao obter pedido:', error);
      throw error;
    }
  }

  static async obterTodos(filtro = {}) {
    try {
      if (db.USE_MEMORY) {
        let pedidos = [...db.memoryData.pedidos];
        if (filtro.status) {
          pedidos = pedidos.filter(p => p.status === filtro.status);
        }
        return pedidos.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      }

      let query = 'SELECT * FROM pedidos';
      const params = [];

      if (filtro.status) {
        query += ' WHERE status = $1';
        params.push(filtro.status);
      }

      query += ' ORDER BY created_at DESC';
      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('Erro ao obter pedidos:', error);
      throw error;
    }
  }

  static async atualizarStatus(id, novoStatus, updatedBy = 'sistema') {
    try {
      if (db.USE_MEMORY) {
        const pedido = db.memoryData.pedidos.find(p => p.id === id);
        if (!pedido) throw new Error('Pedido não encontrado');

        const statusAnterior = pedido.status;
        pedido.status = novoStatus;
        pedido.updated_at = new Date();

        // Registrar no histórico
        db.memoryData.historico_status.push({
          id: uuidv4(),
          pedido_id: id,
          status_anterior: statusAnterior,
          status_novo: novoStatus,
          updated_by: updatedBy,
          created_at: new Date(),
        });

        return pedido;
      }

      // Obter status atual
      const pedido = await this.obterPorId(id);
      const statusAnterior = pedido.status;

      // Atualizar status
      const result = await db.query(
        `UPDATE pedidos 
         SET status = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING *`,
        [novoStatus, id]
      );

      // Registrar no histórico
      await db.query(
        `INSERT INTO historico_status (pedido_id, status_anterior, status_novo, updated_by)
         VALUES ($1, $2, $3, $4)`,
        [id, statusAnterior, novoStatus, updatedBy]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      throw error;
    }
  }

  static async atualizarPagamento(id, paymentId, paymentStatus) {
    try {
      if (db.USE_MEMORY) {
        const pedido = db.memoryData.pedidos.find(p => p.id === id);
        if (!pedido) throw new Error('Pedido não encontrado');

        pedido.payment_id = paymentId;
        pedido.payment_status = paymentStatus;
        pedido.updated_at = new Date();
        return pedido;
      }

      const result = await db.query(
        `UPDATE pedidos 
         SET payment_id = $1, payment_status = $2, updated_at = CURRENT_TIMESTAMP
         WHERE id = $3
         RETURNING *`,
        [paymentId, paymentStatus, id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Erro ao atualizar pagamento:', error);
      throw error;
    }
  }

  static async adicionarItens(pedidoId, itens) {
    try {
      if (db.USE_MEMORY) {
        itens.forEach(item => {
          db.memoryData.itens_pedido.push({
            id: uuidv4(),
            pedido_id: pedidoId,
            nome_produto: item.nome,
            categoria: item.categoria,
            quantidade: item.quantidade,
            preco_unitario: item.preco,
            observacoes: item.observacoes || '',
            created_at: new Date(),
          });
        });
        return true;
      }

      const queries = itens.map((item) =>
        db.query(
          `INSERT INTO itens_pedido (pedido_id, nome_produto, categoria, quantidade, preco_unitario, observacoes)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [pedidoId, item.nome, item.categoria, item.quantidade, item.preco, item.observacoes || '']
        )
      );

      await Promise.all(queries);
      return true;
    } catch (error) {
      console.error('Erro ao adicionar itens:', error);
      throw error;
    }
  }

  static async obterComItens(id) {
    try {
      if (db.USE_MEMORY) {
        const pedido = db.memoryData.pedidos.find(p => p.id === id);
        if (!pedido) return null;

        const itens = db.memoryData.itens_pedido.filter(i => i.pedido_id === id);
        return { ...pedido, itens };
      }

      const pedido = await this.obterPorId(id);
      if (!pedido) return null;

      const itemsResult = await db.query(
        'SELECT * FROM itens_pedido WHERE pedido_id = $1',
        [id]
      );

      return {
        ...pedido,
        itens: itemsResult.rows,
      };
    } catch (error) {
      console.error('Erro ao obter pedido com itens:', error);
      throw error;
    }
  }

  static async deletar(id) {
    try {
      if (db.USE_MEMORY) {
        const index = db.memoryData.pedidos.findIndex(p => p.id === id);
        if (index === -1) return null;
        return db.memoryData.pedidos.splice(index, 1)[0];
      }

      const result = await db.query(
        'DELETE FROM pedidos WHERE id = $1 RETURNING *',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Erro ao deletar pedido:', error);
      throw error;
    }
  }
}

module.exports = Pedido;
