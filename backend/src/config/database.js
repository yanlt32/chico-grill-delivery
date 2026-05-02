const { Pool } = require('pg');
require('dotenv').config();

const hasDbConfig = !!(process.env.DB_HOST || process.env.DATABASE_URL || process.env.DB_USER || process.env.DB_NAME);
const USE_MEMORY = process.env.USE_MEMORY === 'true' || !hasDbConfig;

let pool = null;

if (!USE_MEMORY) {
  pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'chico_grill_delivery',
  });
}

// ===== MEMÓRIA (Para testes sem PostgreSQL) =====
const memoryData = {
  pedidos: [],
  itens_pedido: [],
  historico_status: [],
};

// Criar tabelas automaticamente
async function createTables() {
  if (USE_MEMORY) {
    console.log('💾 Usando banco de dados em MEMÓRIA (testes)');
    return true;
  }

  try {
    console.log('🗄️  Criando tabelas...');

    // Tabela de pedidos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pedidos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        nome_cliente VARCHAR(255) NOT NULL,
        endereco TEXT NOT NULL,
        telefone VARCHAR(20),
        cpf VARCHAR(20),
        status VARCHAR(50) DEFAULT 'aguardando_pagamento',
        total DECIMAL(10, 2) NOT NULL,
        payment_id VARCHAR(255),
        payment_status VARCHAR(50),
        avaliacao_estrela INTEGER,
        avaliacao_comentario TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabela de itens do pedido
    await pool.query(`
      CREATE TABLE IF NOT EXISTS itens_pedido (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        pedido_id UUID NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
        nome_produto VARCHAR(255) NOT NULL,
        categoria VARCHAR(100),
        quantidade INTEGER NOT NULL,
        preco_unitario DECIMAL(10, 2) NOT NULL,
        observacoes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabela de histórico de status
    await pool.query(`
      CREATE TABLE IF NOT EXISTS historico_status (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        pedido_id UUID NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
        status_anterior VARCHAR(50),
        status_novo VARCHAR(50) NOT NULL,
        updated_by VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Colunas adicionais para pedidos
    await pool.query(`ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS cpf VARCHAR(20);`);
    await pool.query(`ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS user_email VARCHAR(255);`);
    await pool.query(`ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS avaliacao_estrela INTEGER;`);
    await pool.query(`ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS avaliacao_comentario TEXT;`);

    console.log('✅ Tabelas criadas com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao criar tabelas:', error);
    return false;
  }
}

// ===== QUERY WRAPPER (Memory ou PostgreSQL) =====
async function query(text, params) {
  if (USE_MEMORY) {
    return mockQuery(text, params);
  }
  return pool.query(text, params);
}

function mockQuery(text, params) {
  // Mock simples para testes
  return Promise.resolve({
    rows: [],
    rowCount: 0,
  });
}

// Executar se chamado diretamente
if (require.main === module) {
  createTables().then(() => {
    if (!USE_MEMORY && pool) {
      pool.end();
    }
  });
}

module.exports = {
  pool,
  createTables,
  query,
  memoryData,
  USE_MEMORY,
};
