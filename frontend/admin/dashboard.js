const API_URL = window.location.port === '5000'
    ? `${window.location.protocol}//${window.location.hostname}:3000/api`
    : (window.location.hostname === 'localhost'
        ? 'http://localhost:3000/api'
        : '/api');
const ADMIN_KEY = 'chico_admin_auth';
const ADMIN_USER = { email: 'admin@chicogrill.com', senha: 'Admin2026!' };
let pedidos = [];
let cardapio = {};

function atualizarStatusVisual() {
    const isAuth = localStorage.getItem(ADMIN_KEY) === 'true';
    document.getElementById('admin-login').style.display = isAuth ? 'none' : 'flex';
    document.getElementById('dashboard-content').style.display = isAuth ? 'block' : 'none';
}

function loginAdmin() {
    const email = document.getElementById('admin-email').value.trim().toLowerCase();
    const senha = document.getElementById('admin-password').value.trim();
    const error = document.getElementById('admin-error');
    if (email !== ADMIN_USER.email || senha !== ADMIN_USER.senha) {
        error.textContent = 'Email ou senha incorretos.';
        return;
    }
    localStorage.setItem(ADMIN_KEY, 'true');
    atualizarStatusVisual();
    carregarPainel();
}

function logoutAdmin() {
    localStorage.removeItem(ADMIN_KEY);
    atualizarStatusVisual();
}

function carregarPainel() {
    Promise.all([
        fetch(`${API_URL}/pedidos`).then(r => r.json()),
        fetch(`${API_URL}/cardapio`).then(r => r.json()),
    ]).then(([pedidosRes, cardapioRes]) => {
        if (!pedidosRes.success || !cardapioRes.success) {
            return showError('Não foi possível carregar dados do painel.');
        }
        pedidos = pedidosRes.pedidos || [];
        cardapio = cardapioRes.cardapio || {};
        renderizarResumo();
        renderizarCardapioAdmin();
        renderizarFeedback();
        renderizarClientes();
    }).catch(() => showError('Erro de conexão ao carregar o painel.'));
}

function showError(message) {
    const card = document.querySelector('.dashboard-card');
    if (card) card.innerHTML = `<div style="color:#ff7a7a;">${message}</div>`;
}

function renderizarResumo() {
    const total = pedidos.length;
    const emPreparo = pedidos.filter(p => p.status === 'em_preparo').length;
    const prontos = pedidos.filter(p => p.status === 'pronto').length;
    const avaliacoes = pedidos.filter(p => p.avaliacao_estrela).length;
    const clientes = [...new Map(pedidos.filter(p => p.cpf).map(p => [p.cpf, p])).values()].length;
    const cpfs = [...new Set(pedidos.filter(p => p.cpf).map(p => p.cpf))];

    document.getElementById('stat-total').textContent = total;
    document.getElementById('stat-preparo').textContent = emPreparo;
    document.getElementById('stat-prontos').textContent = prontos;
    document.getElementById('stat-avaliacoes').textContent = avaliacoes;
    document.getElementById('stat-clientes').textContent = clientes;
    document.getElementById('stat-cpfs').textContent = cpfs.length;
}

function renderizarCardapioAdmin() {
    const tbody = document.querySelector('#cardapio-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    Object.keys(cardapio).forEach(categoria => {
        cardapio[categoria].forEach(item => {
            tbody.insertAdjacentHTML('beforeend', `
                <tr>
                    <td>${item.nome}</td>
                    <td>${categoria}</td>
                    <td>R$ ${item.preco.toFixed(2)}</td>
                    <td>
                        <input class="input-price" type="number" step="0.01" min="0" value="${item.preco.toFixed(2)}" data-item-id="${item.id}">
                    </td>
                </tr>
            `);
        });
    });
}

function renderizarFeedback() {
    const tbody = document.querySelector('#feedback-table tbody');
    if (!tbody) return;
    const avaliados = pedidos.filter(p => p.avaliacao_estrela);
    if (avaliados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4">Nenhuma avaliação registrada ainda.</td></tr>';
        return;
    }
    tbody.innerHTML = avaliados.map(p => `
        <tr>
            <td>#${p.id.slice(0,8)}</td>
            <td>${p.nome_cliente || '---'}</td>
            <td>${'★'.repeat(p.avaliacao_estrela)}${'☆'.repeat(5 - p.avaliacao_estrela)}</td>
            <td>${p.avaliacao_comentario || 'Sem comentário'}</td>
        </tr>
    `).join('');
}

function renderizarClientes() {
    const tbody = document.querySelector('#clientes-table tbody');
    if (!tbody) return;
    const clientesUnicos = [...new Map(pedidos.filter(p => p.cpf).map(p => [p.cpf, p])).values()];
    if (!clientesUnicos.length) {
        tbody.innerHTML = '<tr><td colspan="3">Nenhum cliente registrado ainda.</td></tr>';
        return;
    }
    tbody.innerHTML = clientesUnicos.map(p => `
        <tr>
            <td>${p.nome_cliente || '---'}</td>
            <td>${p.telefone || '---'}</td>
            <td>${formatCpf(p.cpf)}</td>
        </tr>
    `).join('');
}

function salvarPrecoCardapio() {
    const inputs = Array.from(document.querySelectorAll('#cardapio-table input[data-item-id]'));
    const updates = {};
    inputs.forEach(input => {
        const id = input.dataset.itemId;
        const preco = parseFloat(input.value.replace(',', '.'));
        if (!Number.isNaN(preco) && preco >= 0) {
            updates[id] = preco.toFixed(2);
        }
    });
    fetch(`${API_URL}/admin/cardapio`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
    }).then(r => r.json()).then(data => {
        if (data.success) {
            showAdminToast('Preços atualizados com sucesso.');
            carregarPainel();
        } else {
            showAdminToast('Erro ao salvar preços.', true);
        }
    }).catch(() => showAdminToast('Erro de conexão ao salvar preços.', true));
}

function copiarCPFs() {
    const cpfs = [...new Set(pedidos.filter(p => p.cpf).map(p => formatCpf(p.cpf)))].join('\n');
    if (!cpfs) {
        showAdminToast('Não há CPFs para copiar.', true);
        return;
    }
    navigator.clipboard.writeText(cpfs).then(() => {
        showAdminToast('Lista de CPFs copiada para a área de transferência.');
    }).catch(() => showAdminToast('Não foi possível copiar os CPFs.', true));
}

function formatCpf(value) {
    const digits = (value || '').replace(/\D/g, '').slice(0, 11);
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

function showAdminToast(message, isError = false) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.borderLeftColor = isError ? 'var(--primary)' : 'var(--success)';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}

document.addEventListener('DOMContentLoaded', () => {
    atualizarStatusVisual();
    if (localStorage.getItem(ADMIN_KEY) === 'true') {
        carregarPainel();
    }
});
