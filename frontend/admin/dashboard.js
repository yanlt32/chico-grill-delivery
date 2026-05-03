// ===== ADMIN DASHBOARD =====
const API_URL = window.location.port === '5000'
    ? `${window.location.protocol}//${window.location.hostname}:3000/api`
    : (window.location.hostname === 'localhost'
        ? 'http://localhost:3000/api'
        : '/api');

const ADMIN_KEY = 'chico_admin_auth';
const ADMIN_USER = { email: 'admin@chicogrill.com', senha: 'Admin2026!' };
let pedidos = [];
let cardapio = {};

// ===== UTILITÁRIOS =====
function formatCpf(value) {
    const digits = (value || '').replace(/\D/g, '').slice(0, 11);
    if (digits.length === 11) {
        return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return value || '---';
}

function showAdminToast(message, isError = false) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.borderLeftColor = isError ? 'var(--primary)' : 'var(--success)';
    toast.innerHTML = `
        <i class="${isError ? 'fas fa-exclamation-triangle' : 'fas fa-check-circle'}"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}

// ===== LOGIN / LOGOUT =====
function atualizarStatusVisual() {
    const isAuth = localStorage.getItem(ADMIN_KEY) === 'true';
    const loginDiv = document.getElementById('admin-login');
    const dashboardDiv = document.getElementById('dashboard-content');
    
    if (loginDiv) loginDiv.style.display = isAuth ? 'none' : 'flex';
    if (dashboardDiv) dashboardDiv.style.display = isAuth ? 'block' : 'none';
}

function loginAdmin() {
    const email = document.getElementById('admin-email').value.trim().toLowerCase();
    const senha = document.getElementById('admin-password').value.trim();
    const error = document.getElementById('admin-error');
    
    if (!email || !senha) {
        if (error) error.textContent = 'Preencha email e senha.';
        return;
    }
    
    if (email !== ADMIN_USER.email || senha !== ADMIN_USER.senha) {
        if (error) error.textContent = 'Email ou senha incorretos.';
        return;
    }
    
    localStorage.setItem(ADMIN_KEY, 'true');
    atualizarStatusVisual();
    carregarPainel();
    showAdminToast('Login realizado com sucesso!');
}

function logoutAdmin() {
    localStorage.removeItem(ADMIN_KEY);
    atualizarStatusVisual();
    showAdminToast('Você saiu do painel administrativo.');
}

// ===== CARREGAMENTO DE DADOS =====
function carregarPainel() {
    mostrarLoading(true);
    
    Promise.all([
        fetch(`${API_URL}/pedidos`).then(r => r.json()),
        fetch(`${API_URL}/cardapio`).then(r => r.json()),
    ]).then(([pedidosRes, cardapioRes]) => {
        if (!pedidosRes.success) {
            throw new Error(pedidosRes.error || 'Erro ao carregar pedidos');
        }
        if (!cardapioRes.success) {
            throw new Error(cardapioRes.error || 'Erro ao carregar cardápio');
        }
        
        pedidos = pedidosRes.pedidos || [];
        cardapio = cardapioRes.cardapio || {};
        
        renderizarResumo();
        renderizarCardapioAdmin();
        renderizarFeedback();
        renderizarClientes();
        
        mostrarLoading(false);
    }).catch(err => {
        console.error('Erro no carregamento:', err);
        mostrarLoading(false);
        showAdminToast(err.message || 'Erro de conexão ao carregar o painel.', true);
    });
}

function mostrarLoading(show) {
    const loadingEl = document.getElementById('loading-indicator');
    if (loadingEl) {
        loadingEl.style.display = show ? 'flex' : 'none';
    }
}

// ===== RENDERIZAÇÃO =====
function renderizarResumo() {
    const total = pedidos.length;
    const emPreparo = pedidos.filter(p => p.status === 'em_preparo').length;
    const prontos = pedidos.filter(p => p.status === 'pronto').length;
    const entregues = pedidos.filter(p => p.status === 'entregue').length;
    const avaliacoes = pedidos.filter(p => p.avaliacao_estrela && p.avaliacao_estrela > 0).length;
    
    const clientesUnicos = new Map();
    pedidos.forEach(p => {
        if (p.cpf && p.cpf.trim()) {
            if (!clientesUnicos.has(p.cpf)) {
                clientesUnicos.set(p.cpf, p);
            }
        }
    });
    const clientes = clientesUnicos.size;
    
    const cpfsUnicos = new Set();
    pedidos.forEach(p => {
        if (p.cpf && p.cpf.trim()) {
            cpfsUnicos.add(p.cpf);
        }
    });
    
    const faturamento = pedidos.reduce((sum, p) => sum + (p.total || 0), 0);
    
    const statTotal = document.getElementById('stat-total');
    const statPreparo = document.getElementById('stat-preparo');
    const statProntos = document.getElementById('stat-prontos');
    const statEntregues = document.getElementById('stat-entregues');
    const statAvaliacoes = document.getElementById('stat-avaliacoes');
    const statClientes = document.getElementById('stat-clientes');
    const statCpfs = document.getElementById('stat-cpfs');
    const statFaturamento = document.getElementById('stat-faturamento');
    
    if (statTotal) statTotal.textContent = total;
    if (statPreparo) statPreparo.textContent = emPreparo;
    if (statProntos) statProntos.textContent = prontos;
    if (statEntregues) statEntregues.textContent = entregues;
    if (statAvaliacoes) statAvaliacoes.textContent = avaliacoes;
    if (statClientes) statClientes.textContent = clientes;
    if (statCpfs) statCpfs.textContent = cpfsUnicos.size;
    if (statFaturamento) statFaturamento.textContent = `R$ ${faturamento.toFixed(2)}`;
}

function renderizarCardapioAdmin() {
    const tbody = document.querySelector('#cardapio-table tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    const categorias = ['espetos', 'burgers', 'bebidas'];
    const categoriaLabels = {
        espetos: '🔥 Espetos',
        burgers: '🍔 Burgers',
        bebidas: '🥤 Bebidas'
    };
    
    categorias.forEach(categoria => {
        const itens = cardapio[categoria] || [];
        itens.forEach(item => {
            const row = tbody.insertRow();
            row.insertCell(0).innerHTML = `<strong>${item.nome}</strong>`;
            row.insertCell(1).innerHTML = `<span class="cat-badge-admin">${categoriaLabels[categoria]}</span>`;
            row.insertCell(2).innerHTML = `<span class="price-cell"><span class="price-prefix">R$</span> ${item.preco.toFixed(2)}</span>`;
            row.insertCell(3).innerHTML = `
                <div class="price-cell">
                    <span class="price-prefix">R$</span>
                    <input type="number" step="0.01" min="0" value="${item.preco.toFixed(2)}" 
                           class="price-input" data-item-id="${item.id}" data-categoria="${categoria}">
                </div>
            `;
        });
    });
}

function renderizarFeedback() {
    const tbody = document.querySelector('#feedback-table tbody');
    if (!tbody) return;
    
    const avaliados = pedidos.filter(p => p.avaliacao_estrela && p.avaliacao_estrela > 0);
    
    if (avaliados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--text-muted);">Nenhuma avaliação registrada ainda.</td></tr>';
        return;
    }
    
    tbody.innerHTML = avaliados.map(p => {
        const comentario = p.avaliacao_comentario || 'Sem comentário';
        const comentarioEscaped = comentario.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
        return `
            <tr>
                <td><span style="font-family:Space Mono; font-size:0.75rem;">#${p.id.slice(0,8)}</span></td>
                <td><strong>${p.nome_cliente || 'Anônimo'}</strong><br><small style="color:var(--text-muted);">${p.telefone || '---'}</small></td>
                <td><div class="stars-display">${'★'.repeat(p.avaliacao_estrela)}${'☆'.repeat(5 - p.avaliacao_estrela)}</div></td>
                <td><div class="comentario-preview" title="${comentarioEscaped}">${comentario}</div></td>
                <td>${new Date(p.created_at || Date.now()).toLocaleDateString('pt-BR')}</td>
            </tr>
        `;
    }).join('');
}

function renderizarClientes() {
    const tbody = document.querySelector('#clientes-table tbody');
    if (!tbody) return;
    
    const clientesMap = new Map();
    pedidos.forEach(p => {
        if (p.cpf && p.cpf.trim()) {
            if (!clientesMap.has(p.cpf)) {
                clientesMap.set(p.cpf, {
                    nome: p.nome_cliente,
                    telefone: p.telefone,
                    cpf: p.cpf,
                    email: p.user_email,
                    ultimoPedido: p.created_at,
                    totalPedidos: 1,
                    totalGasto: p.total || 0
                });
            } else {
                const existing = clientesMap.get(p.cpf);
                existing.totalPedidos++;
                existing.totalGasto += (p.total || 0);
                if (new Date(p.created_at) > new Date(existing.ultimoPedido)) {
                    existing.ultimoPedido = p.created_at;
                }
            }
        }
    });
    
    const clientesList = Array.from(clientesMap.values()).sort((a, b) => b.totalGasto - a.totalGasto);
    
    if (clientesList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:var(--text-muted);">Nenhum cliente registrado ainda.</td></tr>';
        return;
    }
    
    tbody.innerHTML = clientesList.map(c => `
        <tr>
            <td><strong>${c.nome || '---'}</strong><br><small style="color:var(--text-muted);">${c.email || 'sem email'}</small></td>
            <td>${c.telefone || '---'}</td>
            <td>${formatCpf(c.cpf)}</td>
            <td>${c.totalPedidos}</td>
            <td><span class="price-cell"><span class="price-prefix">R$</span> ${c.totalGasto.toFixed(2)}</span></td>
            <td>${c.ultimoPedido ? new Date(c.ultimoPedido).toLocaleDateString('pt-BR') : '---'}</td>
        </tr>
    `).join('');
}

// ===== AÇÕES =====
function salvarPrecoCardapio() {
    const inputs = document.querySelectorAll('#cardapio-table .price-input');
    const updates = {};
    
    inputs.forEach(input => {
        const id = input.dataset.itemId;
        const preco = parseFloat(input.value.replace(',', '.'));
        if (!isNaN(preco) && preco >= 0) {
            updates[id] = preco.toFixed(2);
        }
    });
    
    if (Object.keys(updates).length === 0) {
        showAdminToast('Nenhum preço para atualizar.', true);
        return;
    }
    
    showAdminToast('Salvando alterações...');
    
    fetch(`${API_URL}/admin/cardapio`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
    })
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            showAdminToast('Preços atualizados com sucesso!');
            carregarPainel();
        } else {
            showAdminToast(data.error || 'Erro ao salvar preços.', true);
        }
    })
    .catch(() => {
        showAdminToast('Erro de conexão ao salvar preços.', true);
    });
}

function copiarCPFs() {
    const cpfs = [...new Set(pedidos.filter(p => p.cpf && p.cpf.trim()).map(p => formatCpf(p.cpf)))];
    
    if (cpfs.length === 0) {
        showAdminToast('Não há CPFs para copiar.', true);
        return;
    }
    
    const texto = cpfs.join('\n');
    navigator.clipboard.writeText(texto).then(() => {
        showAdminToast(`✅ ${cpfs.length} CPFs copiados para área de transferência!`);
    }).catch(() => {
        showAdminToast('Não foi possível copiar os CPFs.', true);
    });
}

function copiarEmails() {
    const emails = [...new Set(pedidos.filter(p => p.user_email && p.user_email.trim()).map(p => p.user_email))];
    
    if (emails.length === 0) {
        showAdminToast('Não há emails para copiar.', true);
        return;
    }
    
    const texto = emails.join('\n');
    navigator.clipboard.writeText(texto).then(() => {
        showAdminToast(`✅ ${emails.length} emails copiados para área de transferência!`);
    }).catch(() => {
        showAdminToast('Não foi possível copiar os emails.', true);
    });
}

function exportarRelatorio() {
    const data = {
        pedidos: pedidos,
        cardapio: cardapio,
        exportadoEm: new Date().toISOString(),
        totalPedidos: pedidos.length,
        faturamentoTotal: pedidos.reduce((sum, p) => sum + (p.total || 0), 0)
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chico_grill_relatorio_${new Date().toISOString().slice(0,19).replace(/:/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showAdminToast('Relatório exportado com sucesso!');
}

// ===== EVENTOS =====
document.addEventListener('DOMContentLoaded', () => {
    atualizarStatusVisual();
    if (localStorage.getItem(ADMIN_KEY) === 'true') {
        carregarPainel();
    }
    
    const passwordInput = document.getElementById('admin-password');
    if (passwordInput) {
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                loginAdmin();
            }
        });
    }
});

// Expor funções globalmente
window.loginAdmin = loginAdmin;
window.logoutAdmin = logoutAdmin;
window.salvarPrecoCardapio = salvarPrecoCardapio;
window.copiarCPFs = copiarCPFs;
window.copiarEmails = copiarEmails;
window.exportarRelatorio = exportarRelatorio;