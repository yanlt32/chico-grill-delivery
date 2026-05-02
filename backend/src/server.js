const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { createTables } = require('./config/database');
const pedidosRoutes = require('./routes/pedidos');
const pagamentosRoutes = require('./routes/pagamentos');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

// ===== MIDDLEWARE =====
app.use(cors({ origin: '*' }));
app.use(express.json());

// ===== NOTIFICAÇÃO (injetada via app.locals para evitar circular require) =====
function notificarMudancaPedido(pedidoId, novoStatus) {
  console.log(`📢 Notificando: pedido ${pedidoId} → ${novoStatus}`);
  io.to(`pedido_${pedidoId}`).emit('status_atualizado', {
    pedidoId, status: novoStatus, timestamp: new Date(),
  });
  if (novoStatus === 'pago') {
    io.to('cozinha').emit('novo_pedido', { pedidoId });
    console.log('🍳 Notificando cozinha: novo pedido');
  } else if (novoStatus === 'pronto') {
    io.to('motoboy').emit('pedido_pronto', { pedidoId });
    console.log('🛵 Notificando motoboy: pedido pronto');
  }
}

app.locals.notificarMudancaPedido = notificarMudancaPedido;

// ===== CARDÁPIO =====
const CARDAPIO = {
  espetos: [
    { id: 'esp_carne', nome: 'Carne', preco: 10.0, categoria: 'espetos' },
    { id: 'esp_misto', nome: 'Misto', preco: 10.0, categoria: 'espetos' },
    { id: 'esp_kafta', nome: 'Kafta', preco: 10.0, categoria: 'espetos' },
    { id: 'esp_coracao', nome: 'Coração', preco: 10.0, categoria: 'espetos' },
    { id: 'esp_tulipa', nome: 'Tulipa', preco: 6.0, categoria: 'espetos' },
    { id: 'esp_panceta', nome: 'Panceta', preco: 6.0, categoria: 'espetos' },
    { id: 'esp_paoalho', nome: 'Pão de Alho', preco: 6.0, categoria: 'espetos' },
    { id: 'esp_frango', nome: 'Filé de Frango', preco: 6.0, categoria: 'espetos' },
    { id: 'esp_queijo', nome: 'Queijo Coalho', preco: 6.0, categoria: 'espetos' },
    { id: 'esp_toscana', nome: 'Linguiça Toscana', preco: 6.0, categoria: 'espetos' },
    { id: 'esp_apimentada', nome: 'Linguiça Apimentada', preco: 6.0, categoria: 'espetos' },
  ],
  burgers: [
    { id: 'burger_espeto', nome: 'Lanche de Espeto', preco: 14.0, categoria: 'burgers', descricao: 'Acompanha: vinagrete, barbecue e molho especial' },
    { id: 'burger_espeto_duplo', nome: 'Lanche de Espeto Duplo', preco: 20.0, categoria: 'burgers', descricao: 'Acompanha: vinagrete, barbecue e molho especial' },
    { id: 'burger_picanha', nome: 'Big Picanha', preco: 21.0, categoria: 'burgers', descricao: 'Bife de picanha + vinagrete, barbecue, molho especial e cheddar' },
    { id: 'burger_najla', nome: 'Big Najla', preco: 17.0, categoria: 'burgers', descricao: 'Burger artesanal de costela + acompanhamentos' },
    { id: 'burger_jojo', nome: 'Big Jojo', preco: 27.0, categoria: 'burgers', descricao: 'Burger duplo artesanal de costela + acompanhamentos' },
    { id: 'burger_toguro', nome: 'Big Toguro', preco: 37.0, categoria: 'burgers', descricao: 'Burger triplo artesanal de costela + acompanhamentos' },
    { id: 'burger_bony', nome: 'Big Bony', preco: 47.0, categoria: 'burgers', descricao: 'Burger quádruplo artesanal de costela + acompanhamentos' },
  ],
  bebidas: [
    { id: 'bebida_heineken', nome: 'Heineken', preco: 8.0, categoria: 'bebidas', tipo: 'cerveja' },
    { id: 'bebida_stella', nome: 'Stella Artois', preco: 8.0, categoria: 'bebidas', tipo: 'cerveja' },
    { id: 'bebida_budweiser', nome: 'Budweiser', preco: 7.0, categoria: 'bebidas', tipo: 'cerveja' },
    { id: 'bebida_eisenbahn', nome: 'Eisenbahn', preco: 8.0, categoria: 'bebidas', tipo: 'cerveja' },
    { id: 'bebida_brahma', nome: 'Brahma Duplo', preco: 9.0, categoria: 'bebidas', tipo: 'cerveja' },
    { id: 'bebida_skol', nome: 'Skol', preco: 7.0, categoria: 'bebidas', tipo: 'cerveja' },
    { id: 'bebida_amstel', nome: 'Amstel', preco: 8.0, categoria: 'bebidas', tipo: 'cerveja' },
    { id: 'bebida_refri', nome: 'Refrigerante', preco: 6.0, categoria: 'bebidas' },
    { id: 'bebida_suco', nome: 'Suco', preco: 6.0, categoria: 'bebidas' },
    { id: 'bebida_agua', nome: 'Água', preco: 3.0, categoria: 'bebidas' },
  ],
};

// ===== ROTAS =====
app.get('/', (req, res) => res.json({ status: 'OK', message: '🍔 CHICO GRILL API' }));
app.get('/api/cardapio', (req, res) => res.json({ success: true, cardapio: CARDAPIO }));
app.get('/health', (req, res) => res.json({ status: 'OK' }));
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/pagamentos', pagamentosRoutes);

// ===== SOCKET.IO =====
io.on('connection', (socket) => {
  console.log(`👤 Cliente conectado: ${socket.id}`);

  socket.on('acompanhar_pedido', (pedidoId) => {
    socket.join(`pedido_${pedidoId}`);
    console.log(`📍 Acompanhando pedido: ${pedidoId}`);
  });

  socket.on('sair_acompanhamento', (pedidoId) => socket.leave(`pedido_${pedidoId}`));

  socket.on('conectar_cozinha', () => {
    socket.join('cozinha');
    console.log('👨‍🍳 Cozinha conectada');
  });

  socket.on('conectar_motoboy', () => {
    socket.join('motoboy');
    console.log('🛵 Motoboy conectado');
  });

  socket.on('disconnect', () => console.log(`👋 Desconectado: ${socket.id}`));
});

module.exports = { app, io, notificarMudancaPedido };

// ===== START =====
const PORT = process.env.PORT || 3000;
async function iniciar() {
  try {
    console.log('🚀 Iniciando servidor...');
    await createTables();
    server.listen(PORT, () => {
      console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
      console.log(`📡 WebSocket ativo em ws://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar:', error);
    process.exit(1);
  }
}
iniciar();