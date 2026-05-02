// ===== AUTH =====
const SENHA = 'motoboy123';
function iniciarLogin() {
    if (localStorage.getItem('chico_motoboy_auth') === SENHA) { initMotoboy(); return; }
    document.getElementById('login-modal').style.display = 'flex';
}
function submitLogin() {
    const input = document.getElementById('login-password').value;
    const error = document.getElementById('login-error');
    if (input === SENHA) {
        localStorage.setItem('chico_motoboy_auth', SENHA);
        document.getElementById('login-modal').style.display = 'none';
        error.textContent = '';
        initMotoboy();
    } else {
        error.textContent = 'Senha incorreta. Tente novamente.';
    }
}
function logout() { localStorage.removeItem('chico_motoboy_auth'); window.location.href = '../index.html'; }

function initMotoboy() {
    iniciarClock();
    conectarSocket();
    carregarPedidos();
    setInterval(carregarPedidos, 5000);
}

// ===== CONFIG =====
const API_URL = 'http://localhost:3000/api';
const socket = io('http://localhost:3000', { reconnection: true });
let pedidos = { pronto: [], saiu_entrega: [], entregue: [] };

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    iniciarLogin();
});

function iniciarClock() {
    const tick = () => {
        document.getElementById('clock').textContent =
            new Date().toLocaleTimeString('pt-BR');
    };
    tick(); setInterval(tick, 1000);
}

// ===== SOCKET =====
function conectarSocket() {
    socket.emit('conectar_motoboy');
    socket.on('pedido_pronto', () => { showToast('📦 Novo pedido pronto para entrega!'); carregarPedidos(); });
}

// ===== DADOS =====
function carregarPedidos() {
    fetch(`${API_URL}/pedidos`)
        .then(r => r.json())
        .then(data => {
            if (!data.success) return;
            pedidos = { pronto: [], saiu_entrega: [], entregue: [] };
            data.pedidos.forEach(p => {
                if (p.status === 'pronto') pedidos.pronto.push(p);
                else if (p.status === 'saiu_entrega') pedidos.saiu_entrega.push(p);
                else if (p.status === 'entregue') pedidos.entregue.push(p);
            });
            renderizar();
        })
        .catch(err => console.error(err));
}

// ===== RENDER =====
function renderizar() {
    renderCol('col-prontos', pedidos.pronto, 'pronto');
    renderCol('col-rota', pedidos.saiu_entrega, 'rota');
    renderCol('col-entregues', pedidos.entregue, 'entregue');

    document.getElementById('badge-prontos').textContent = pedidos.pronto.length;
    document.getElementById('badge-rota').textContent = pedidos.saiu_entrega.length;
    document.getElementById('badge-entregues').textContent = pedidos.entregue.length;
    document.getElementById('count-prontos').textContent = pedidos.pronto.length;
    document.getElementById('count-rota').textContent = pedidos.saiu_entrega.length;
    document.getElementById('count-entregues').textContent = pedidos.entregue.length;
}

function renderCol(colId, lista, tipo) {
    const col = document.getElementById(colId);
    if (lista.length === 0) { col.innerHTML = '<div class="vazio">— Nenhum pedido —</div>'; return; }
    col.innerHTML = lista.map(p => cardHTML(p, tipo)).join('');
}

function cardHTML(p, tipo) {
    const itens = (p.itens || []).map(i => `
        <div class="card-item">
            <span class="card-item-nome">${i.quantidade}x ${i.nome_produto}</span>
            <span class="card-item-preco">R$ ${(i.preco_unitario * i.quantidade).toFixed(2)}</span>
        </div>
    `).join('') || '<div class="card-item"><span style="color:#555">Sem itens</span></div>';

    const badgeMap = { pronto: 'badge-pronto', rota: 'badge-rota', entregue: 'badge-entregue' };
    const badgeLabel = { pronto: 'Pronto', rota: 'Em rota', entregue: 'Entregue' };

    const acoes = tipo === 'pronto'
        ? `<button class="btn btn-moto" onclick="atualizarStatus('${p.id}','saiu_entrega')">🛵 Saiu para Entrega</button>`
        : tipo === 'rota'
        ? `<button class="btn btn-done" onclick="atualizarStatus('${p.id}','entregue')">✔️ Confirmar Entrega</button>`
        : '';

    const hora = new Date(p.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    return `
    <div class="pedido-card">
        <div class="card-top">
            <div class="card-id">Pedido <span>#${p.id.slice(0,8)}</span></div>
            <div style="display:flex;align-items:center;gap:0.5rem">
                <div class="card-time">${hora}</div>
                <div class="card-badge ${badgeMap[tipo]}">${badgeLabel[tipo]}</div>
            </div>
        </div>
        <div class="card-body">
            <div class="card-cliente">${p.nome_cliente}</div>
            <div class="card-telefone">${p.telefone || '—'}</div>
            <div class="card-endereco">📍 ${p.endereco}</div>
            <div class="card-itens">${itens}</div>
            <div class="card-total">
                <span class="card-total-label">Total</span>
                <span class="card-total-value">R$ ${(p.total + 5).toFixed(2)}</span>
            </div>
        </div>
        ${acoes ? `<div class="card-actions">${acoes}</div>` : ''}
    </div>`;
}

// ===== AÇÕES =====
function atualizarStatus(id, status) {
    fetch(`${API_URL}/pedidos/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
    }).then(r => r.json()).then(d => {
        if (d.success) {
            const msgs = { saiu_entrega: '🛵 Saiu para entrega!', entregue: '✔️ Entrega confirmada!' };
            showToast(msgs[status] || 'Atualizado!');
            carregarPedidos();
        }
    });
}

// ===== TOAST =====
function showToast(msg) {
    const t = document.createElement('div');
    t.className = 'toast'; t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3500);
}