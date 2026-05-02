// ===== AUTH =====
const COZINHA_CREDENTIALS = { email: 'cozinha@chicogrill.com', senha: 'Cozinha2026!' };
function iniciarLogin() {
    if (localStorage.getItem('chico_cozinha_auth') === COZINHA_CREDENTIALS.email) { initCozinha(); return; }
    document.getElementById('login-modal').style.display = 'flex';
}
function submitLogin() {
    const email = document.getElementById('login-email').value.trim().toLowerCase();
    const senha = document.getElementById('login-password').value;
    const error = document.getElementById('login-error');
    if (email === COZINHA_CREDENTIALS.email && senha === COZINHA_CREDENTIALS.senha) {
        localStorage.setItem('chico_cozinha_auth', COZINHA_CREDENTIALS.email);
        document.getElementById('login-modal').style.display = 'none';
        error.textContent = '';
        initCozinha();
    } else {
        error.textContent = 'Email ou senha incorretos. Tente novamente.';
    }
}
function logout() { localStorage.removeItem('chico_cozinha_auth'); window.location.href = '../index.html'; }

function initCozinha() {
    iniciarClock();
    conectarSocket();
    carregarPedidos();
    setInterval(carregarPedidos, 5000);
}

// ===== CONFIG =====
const API_URL = window.location.port === '5000'
    ? `${window.location.protocol}//${window.location.hostname}:3000/api`
    : (window.location.hostname === 'localhost'
        ? 'http://localhost:3000/api'
        : '/api');
const socketUrl = window.location.port === '5000'
    ? `${window.location.protocol}//${window.location.hostname}:3000`
    : window.location.origin;
const socket = io(socketUrl, { reconnection: true });
let pedidos = { pago: [], em_preparo: [], pronto: [] };

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
    socket.emit('conectar_cozinha');
    socket.on('novo_pedido', () => { showToast('🔔 Novo pedido recebido!'); carregarPedidos(); });
}

// ===== DADOS =====
function carregarPedidos() {
    fetch(`${API_URL}/pedidos`)
        .then(r => r.json())
        .then(data => {
            if (!data.success) return;
            pedidos = { pago: [], em_preparo: [], pronto: [] };
            data.pedidos.forEach(p => {
                if (p.status === 'pago') pedidos.pago.push(p);
                else if (p.status === 'em_preparo') pedidos.em_preparo.push(p);
                else if (p.status === 'pronto') pedidos.pronto.push(p);
            });
            renderizar();
        })
        .catch(err => console.error(err));
}

// ===== RENDER =====
function renderizar() {
    renderCol('col-novos', pedidos.pago, 'novo');
    renderCol('col-preparo', pedidos.em_preparo, 'preparo');
    renderCol('col-prontos', pedidos.pronto, 'pronto');

    ['novos','preparo','prontos'].forEach((k, i) => {
        const counts = [pedidos.pago.length, pedidos.em_preparo.length, pedidos.pronto.length];
        document.getElementById(`badge-${k}`).textContent = counts[i];
        document.getElementById(`count-${k}`).textContent = counts[i];
    });
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

    const badgeMap = { novo: 'badge-novo', preparo: 'badge-preparo', pronto: 'badge-pronto' };
    const badgeLabel = { novo: 'Novo', preparo: 'Em preparo', pronto: 'Pronto' };

    const acoes = tipo === 'novo'
        ? `<button class="btn btn-fire" onclick="atualizarStatus('${p.id}','em_preparo')">🔥 Iniciar Preparo</button>`
        : tipo === 'preparo'
        ? `<button class="btn btn-check" onclick="atualizarStatus('${p.id}','pronto')">✅ Marcar Pronto</button>`
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
            const msgs = { em_preparo: '🔥 Preparo iniciado!', pronto: '✅ Pedido pronto!' };
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