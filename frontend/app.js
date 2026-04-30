// ===== CONFIG =====
const API_URL = 'http://localhost:3000/api';

const IMAGENS = {
    espetos: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&w=500&q=80',
    burgers: {
        burger_najla:       'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=500&q=80',
        burger_jojo:        'https://images.unsplash.com/photo-1553979459-d2229a743c2b?auto=format&fit=crop&w=500&q=80',
        burger_toguro:      'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=500&q=80',
        burger_bony:        'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&w=500&q=80',
        burger_picanha:     'https://images.unsplash.com/photo-1551782450-17144efb9c50?auto=format&fit=crop&w=500&q=80',
        burger_espeto:      'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=500&q=80',
        burger_espeto_duplo:'https://images.unsplash.com/photo-1553979459-d2229a743c2b?auto=format&fit=crop&w=500&q=80',
    },
    bebidas: { emoji: '🍺', bebida_refri: '🥤', bebida_suco: '🍊', bebida_agua: '💧' }
};

function getImagem(produto, categoria) {
    if (categoria === 'espetos') return IMAGENS.espetos;
    if (categoria === 'burgers') return IMAGENS.burgers[produto.id] || IMAGENS.burgers.burger_najla;
    return null;
}

// ===== STATE =====
let cardapio = {};
let carrinho = [];
let pedidoAtual = null;
let socket = null;

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('🍔 CHICO GRILL Delivery iniciado');
    carregarCardapio();
    conectarSocket();
});

// ===== CARDÁPIO =====
function carregarCardapio() {
    fetch(`${API_URL}/cardapio`)
        .then(res => res.json())
        .then(data => {
            cardapio = data.cardapio;
            renderizarCardapio('espetos');
        })
        .catch(err => {
            console.error('Erro ao carregar cardápio:', err);
            alert('Erro ao carregar cardápio. Verifique se o backend está rodando na porta 3000.');
        });
}

function renderizarCardapio(categoria = 'espetos') {
    const container = document.getElementById('produtos-container');
    container.innerHTML = '';
    const produtos = cardapio[categoria] || [];

    produtos.forEach(produto => {
        const card = document.createElement('div');
        card.className = 'produto-card';
        const imgUrl = getImagem(produto, categoria);
        const imgHtml = imgUrl
            ? `<img class="produto-img" src="${imgUrl}" alt="${produto.nome}" loading="lazy">`
            : `<div class="produto-img-placeholder">${IMAGENS.bebidas[produto.id] || IMAGENS.bebidas.emoji}</div>`;

        card.innerHTML = `
            ${imgHtml}
            <div class="produto-body">
                <div class="produto-nome">${produto.nome}</div>
                <div class="produto-descricao">${produto.descricao || ''}</div>
                <div class="produto-footer">
                    <div class="produto-preco">R$ ${produto.preco.toFixed(2)}</div>
                    <div class="produto-quantidade">
                        <label>Qtd</label>
                        <input type="number" value="1" min="1" class="quantidade-input" id="qtd-${produto.id}">
                    </div>
                    <button class="btn-add" onclick="adicionarAoCarrinho('${produto.id}', '${produto.nome}', ${produto.preco}, '${categoria}')">+ Add</button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function filtrarCardapio(categoria) {
    document.querySelectorAll('.btn-categoria').forEach(btn => btn.classList.remove('ativo'));
    event.target.classList.add('ativo');
    renderizarCardapio(categoria);
}

// ===== CARRINHO =====
function adicionarAoCarrinho(produtoId, nome, preco, categoria) {
    const quantidadeInput = document.getElementById(`qtd-${produtoId}`);
    const quantidade = parseInt(quantidadeInput.value) || 1;
    const itemExistente = carrinho.find(item => item.id === produtoId);
    if (itemExistente) {
        itemExistente.quantidade += quantidade;
    } else {
        carrinho.push({ id: produtoId, nome, preco, categoria, quantidade });
    }
    atualizarCarrinho();
    showToast(`✅ ${nome} adicionado ao carrinho!`);
}

function atualizarCarrinho() {
    document.getElementById('carrinho-count').textContent = carrinho.length;
    renderizarCarrinho();
}

function renderizarCarrinho() {
    const container = document.getElementById('carrinho-items');
    if (carrinho.length === 0) {
        container.innerHTML = '<div class="carrinho-vazio">Carrinho vazio</div>';
        atualizarResumo();
        return;
    }
    container.innerHTML = carrinho.map(item => `
        <div class="carrinho-item">
            <div class="carrinho-item-nome">${item.nome}</div>
            <div class="carrinho-item-quantidade">
                <button class="btn btn-small" onclick="diminuirQuantidade('${item.id}')">-</button>
                <input type="number" value="${item.quantidade}" onchange="atualizarQuantidade('${item.id}', this.value)">
                <button class="btn btn-small" onclick="aumentarQuantidade('${item.id}')">+</button>
            </div>
            <div class="carrinho-item-preco">R$ ${(item.preco * item.quantidade).toFixed(2)}</div>
            <button class="btn btn-small btn-secondary" onclick="removerDoCarrinho('${item.id}')">🗑️</button>
        </div>
    `).join('');
    atualizarResumo();
}

function aumentarQuantidade(produtoId) {
    const item = carrinho.find(i => i.id === produtoId);
    if (item) item.quantidade++;
    atualizarCarrinho();
}

function diminuirQuantidade(produtoId) {
    const item = carrinho.find(i => i.id === produtoId);
    if (item && item.quantidade > 1) item.quantidade--;
    atualizarCarrinho();
}

function atualizarQuantidade(produtoId, novaQuantidade) {
    const item = carrinho.find(i => i.id === produtoId);
    if (item) item.quantidade = Math.max(1, parseInt(novaQuantidade) || 1);
    atualizarCarrinho();
}

function removerDoCarrinho(produtoId) {
    carrinho = carrinho.filter(item => item.id !== produtoId);
    atualizarCarrinho();
}

function atualizarResumo() {
    const subtotal = carrinho.reduce((sum, item) => sum + item.preco * item.quantidade, 0);
    const taxa = carrinho.length > 0 ? 5.0 : 0;
    const total = subtotal + taxa;
    document.getElementById('subtotal').textContent = `R$ ${subtotal.toFixed(2)}`;
    document.getElementById('total').textContent = `R$ ${total.toFixed(2)}`;
    document.getElementById('checkout-total').textContent = `R$ ${total.toFixed(2)}`;
    const checkoutItems = document.getElementById('checkout-items');
    if (checkoutItems) {
        checkoutItems.innerHTML = carrinho.map(item => `
            <div class="resumo-item">
                <span>${item.nome} x${item.quantidade}</span>
                <span>R$ ${(item.preco * item.quantidade).toFixed(2)}</span>
            </div>
        `).join('');
    }
}

// ===== NAVEGAÇÃO =====
function mudarView(viewName) {
    document.querySelectorAll('.view').forEach(view => view.classList.remove('ativo'));
    document.getElementById(`view-${viewName}`).classList.add('ativo');
}
function abrirCarrinho() { mudarView('carrinho'); }
function voltarCardapio() { mudarView('cardapio'); }
function voltarCarrinho() { mudarView('carrinho'); }
function irCheckout() {
    if (carrinho.length === 0) { alert('Adicione itens ao carrinho'); return; }
    mudarView('checkout');
}
function voltarCheckout() { mudarView('checkout'); }

// ===== PEDIDO =====
function confirmarPedido(event) {
    event.preventDefault();
    if (carrinho.length === 0) { alert('Adicione itens ao carrinho'); return; }
    const nome = document.getElementById('nome-cliente').value.trim();
    const endereco = document.getElementById('endereco').value.trim();
    const telefone = document.getElementById('telefone').value.trim();
    if (!nome || !endereco || !telefone) { alert('Preencha todos os campos obrigatórios'); return; }
    const subtotal = carrinho.reduce((sum, item) => sum + item.preco * item.quantidade, 0);
    const total = subtotal + 5.0;
    const pedidoData = {
        nome_cliente: nome,
        endereco,
        telefone,
        itens: carrinho.map(item => ({
            nome: item.nome,
            categoria: item.categoria,
            quantidade: item.quantidade,
            preco: item.preco,
            observacoes: document.getElementById('observacoes').value.trim(),
        })),
    };
    fetch(`${API_URL}/pedidos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pedidoData),
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                pedidoAtual = data.pedido;
                mudarView('pagamento');
                iniciarPagamento(pedidoAtual.id, total);
            } else {
                alert('Erro ao criar pedido: ' + data.error);
            }
        })
        .catch(err => { console.error('Erro:', err); alert('Erro ao criar pedido'); });
}

function iniciarPagamento(pedidoId, total) {
    fetch(`${API_URL}/pagamentos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pedido_id: pedidoId }),
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                exibirQRCode(data.payment.qrCode, data.payment.paymentId);
                monitorarPagamento(pedidoId, data.payment.paymentId);
            } else {
                alert('Erro ao gerar QR Code: ' + data.error);
            }
        })
        .catch(err => { console.error('Erro:', err); alert('Erro ao iniciar pagamento'); });
}

function exibirQRCode(qrCode, paymentId) {
    const container = document.getElementById('qr-code');
    container.innerHTML = '';
    if (qrCode) {
        new QRCode(container, { text: qrCode, width: 200, height: 200 });
    }
}

function monitorarPagamento(pedidoId, paymentId) {
    const statusDiv = document.getElementById('pagamento-status');
    const intervalo = setInterval(() => {
        fetch(`${API_URL}/pagamentos/${paymentId}`)
            .then(res => res.json())
            .then(data => {
                if (data.success && data.status.status === 'approved') {
                    clearInterval(intervalo);
                    statusDiv.classList.remove('erro');
                    statusDiv.classList.add('sucesso');
                    statusDiv.innerHTML = '<strong>✅ Pagamento aprovado!</strong><br>Seu pedido foi enviado para a cozinha.';
                    atualizarStatusPedido(pedidoId, 'pago');
                    setTimeout(() => carregarAcompanhamento(pedidoId), 2000);
                }
            })
            .catch(err => console.error('Erro ao verificar pagamento:', err));
    }, 3000);
    setTimeout(() => clearInterval(intervalo), 300000);
}

function pagarComCartao() {
    alert('Integração com cartão em desenvolvimento. Use o QR Code (Pix) por enquanto.');
}

// ===== ACOMPANHAMENTO =====
function carregarAcompanhamento(pedidoId) {
    fetch(`${API_URL}/pedidos/${pedidoId}`)
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                pedidoAtual = data.pedido;
                renderizarAcompanhamento(pedidoAtual);
                mudarView('acompanhamento');
                if (socket) socket.emit('acompanhar_pedido', pedidoId);
            }
        })
        .catch(err => console.error('Erro:', err));
}

function renderizarAcompanhamento(pedido) {
    const statusOrder = ['aguardando_pagamento', 'pago', 'em_preparo', 'pronto', 'saiu_entrega', 'entregue'];
    const infoDiv = document.getElementById('pedido-info');
    infoDiv.innerHTML = `
        <div class="pedido-info-item"><span class="pedido-info-label">Pedido</span><span>#${pedido.id.slice(0, 8)}</span></div>
        <div class="pedido-info-item"><span class="pedido-info-label">Cliente</span><span>${pedido.nome_cliente}</span></div>
        <div class="pedido-info-item"><span class="pedido-info-label">Total</span><span>R$ ${(pedido.total + 5.0).toFixed(2)}</span></div>
        <div class="pedido-info-item"><span class="pedido-info-label">Itens</span><span>${pedido.itens?.length || 0}</span></div>
    `;
    statusOrder.forEach(status => {
        const item = document.getElementById(`status-${status}`);
        if (!item) return;
        item.classList.remove('ativo', 'completo');
        if (status === pedido.status) {
            item.classList.add('ativo');
        } else if (statusOrder.indexOf(status) < statusOrder.indexOf(pedido.status)) {
            item.classList.add('completo');
        }
    });
}

function atualizarStatusPedido(pedidoId, novoStatus) {
    fetch(`${API_URL}/pedidos/${pedidoId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: novoStatus }),
    })
        .then(res => res.json())
        .then(data => { if (data.success) console.log('✅ Status atualizado:', novoStatus); })
        .catch(err => console.error('Erro ao atualizar status:', err));
}

// ===== SOCKET.IO =====
function conectarSocket() {
    socket = io('http://localhost:3000', { reconnection: true });
    socket.on('connect', () => console.log('🔌 Conectado ao servidor de tempo real'));
    socket.on('status_atualizado', (data) => {
        if (pedidoAtual && pedidoAtual.id === data.pedidoId) {
            pedidoAtual.status = data.status;
            renderizarAcompanhamento(pedidoAtual);
        }
    });
    socket.on('disconnect', () => console.log('❌ Desconectado do servidor'));
}

// ===== UTILIDADES =====
function showToast(message) { console.log('🔔', message); }

window.addEventListener('load', () => {
    const params = new URLSearchParams(window.location.search);
    const pedidoId = params.get('pedido_id');
    if (pedidoId) carregarAcompanhamento(pedidoId);
});

// ===== ADMIN MODAL =====
function fecharModalAdmin() {
    document.getElementById('modal-admin').style.display = 'none';
}