// ===== CONFIG =====
const API_URL = window.API_URL || (window.location.port === '5000'
    ? `${window.location.protocol}//${window.location.hostname}:3000/api`
    : '/api');

const IMAGENS = {
    espetos: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&w=600&q=80',
    burgers: {
        burger_najla:        'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80',
        burger_jojo:         'https://images.unsplash.com/photo-1553979459-d2229a743c2b?auto=format&fit=crop&w=600&q=80',
        burger_toguro:       'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=600&q=80',
        burger_bony:         'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&w=600&q=80',
        burger_picanha:      'https://images.unsplash.com/photo-1551782450-17144efb9c50?auto=format&fit=crop&w=600&q=80',
        burger_espeto:       'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80',
        burger_espeto_duplo: 'https://images.unsplash.com/photo-1553979459-d2229a743c2b?auto=format&fit=crop&w=600&q=80',
    },
    bebidas: { emoji: '🍺', bebida_refri: '🥤', bebida_suco: '🍊', bebida_agua: '💧' }
};

function getImagem(produto, categoria) {
    if (categoria === 'espetos') return IMAGENS.espetos;
    if (categoria === 'burgers') return IMAGENS.burgers[produto.id] || IMAGENS.burgers.burger_najla;
    return null;
}

const CATEGORIA_TAG = { espetos: '🔥 Espeto', burgers: '🍔 Burger', bebidas: '🥤 Bebida' };

// ===== STATE =====
let cardapio = {};
let carrinho = [];
let pedidoAtual = null;
let socket = null;
let formaPagamentoSelecionada = 'pix';
const ORDER_STORAGE_KEY = 'chico_pedido_id';
const USERS_KEY = 'chico_users';
const SESSION_KEY = 'chico_user_session';
let usuarioLogado = null;
let ratingSelecionado = 0;

// ===== MENU HAMBURGER =====
function toggleMenu() {
    const hamburger = document.getElementById('hamburger');
    const menuMobile = document.getElementById('menu-mobile');
    const overlay = document.getElementById('menu-overlay');
    
    hamburger.classList.toggle('active');
    menuMobile.classList.toggle('active');
    overlay.classList.toggle('active');
    
    if (menuMobile.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
}

function closeMenu() {
    const hamburger = document.getElementById('hamburger');
    const menuMobile = document.getElementById('menu-mobile');
    const overlay = document.getElementById('menu-overlay');
    
    hamburger.classList.remove('active');
    menuMobile.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    criarToastContainer();
    carregarSessaoUsuario();
    carregarCardapio();
    conectarSocket();
    initHamburgerEvents();
    
    // Verificar pedido na URL
    const pedidoId = new URLSearchParams(window.location.search).get('pedido_id');
    if (pedidoId) carregarAcompanhamento(pedidoId, usuarioLogado?.email);
});

function initHamburgerEvents() {
    const hamburger = document.getElementById('hamburger');
    const overlay = document.getElementById('menu-overlay');
    
    if (hamburger) hamburger.addEventListener('click', toggleMenu);
    if (overlay) overlay.addEventListener('click', closeMenu);
    
    // Fechar menu ao clicar em links
    document.querySelectorAll('.menu-link').forEach(link => {
        link.addEventListener('click', closeMenu);
    });
}

function criarToastContainer() {
    const tc = document.createElement('div');
    tc.className = 'toast-container';
    tc.id = 'toast-container';
    document.body.appendChild(tc);
}

function carregarSessaoUsuario() {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return;
    try {
        usuarioLogado = JSON.parse(raw);
    } catch (error) {
        usuarioLogado = null;
    }
    atualizarCabecalhoUsuario();
    preencherFormularioDados();
}

function salvarSessaoUsuario() {
    if (usuarioLogado) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(usuarioLogado));
    } else {
        localStorage.removeItem(SESSION_KEY);
    }
}

function atualizarCabecalhoUsuario() {
    const btnLogin = document.getElementById('btn-login');
    const btnUser = document.getElementById('btn-user');
    if (!btnLogin || !btnUser) return;
    if (usuarioLogado) {
        btnLogin.textContent = `Olá, ${usuarioLogado.nome.split(' ')[0]}`;
        btnLogin.onclick = () => { abrirDashboard(); closeMenu(); };
        btnUser.style.display = 'inline-flex';
    } else {
        btnLogin.textContent = 'Entrar / Criar';
        btnLogin.onclick = () => { abrirLoginModal(); closeMenu(); };
        btnUser.style.display = 'none';
    }
}

function getUsuarios() {
    try {
        return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    } catch (error) {
        return [];
    }
}

function salvarUsuarios(usuarios) {
    localStorage.setItem(USERS_KEY, JSON.stringify(usuarios));
}

function abrirLoginModal() {
    document.getElementById('login-modal').style.display = 'flex';
    closeMenu();
}

function fecharModalLogin() {
    document.getElementById('login-modal').style.display = 'none';
}

function abrirAcessoModal() {
    document.getElementById('access-modal').style.display = 'flex';
    closeMenu();
}

function fecharAcessoModal() {
    document.getElementById('access-modal').style.display = 'none';
}

function abrirCadastroModal() {
    fecharModalLogin();
    document.getElementById('cadastro-modal').style.display = 'flex';
}

function fecharCadastroModal() {
    document.getElementById('cadastro-modal').style.display = 'none';
}

function loginUsuario(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value.trim().toLowerCase();
    const senha = document.getElementById('login-password').value;
    const error = document.getElementById('login-error');
    if (!email || !senha) {
        error.textContent = 'Preencha email e senha para continuar.';
        return;
    }
    const usuarios = getUsuarios();
    const user = usuarios.find(u => u.email === email && u.senha === senha);
    if (!user) {
        error.textContent = 'Email ou senha incorretos.';
        return;
    }
    usuarioLogado = { nome: user.nome, email: user.email, telefone: user.telefone, cpf: user.cpf, lastOrderId: user.lastOrderId || null };
    salvarSessaoUsuario();
    atualizarCabecalhoUsuario();
    preencherFormularioDados();
    fecharModalLogin();
    error.textContent = '';
    showToast('Login realizado com sucesso!');
    if (usuarioLogado.lastOrderId) carregarDashboard();
}

function cadastrarUsuario(event) {
    event.preventDefault();
    const nome = document.getElementById('cadastro-nome').value.trim();
    const email = document.getElementById('cadastro-email').value.trim().toLowerCase();
    const telefone = document.getElementById('cadastro-telefone').value.trim();
    const cpf = document.getElementById('cadastro-cpf').value.trim();
    const senha = document.getElementById('cadastro-senha').value;
    const error = document.getElementById('cadastro-error');

    if (!nome || !email || !telefone || !cpf || !senha) {
        error.textContent = 'Preencha todos os campos para criar a conta.';
        return;
    }
    if (cpf.replace(/\D/g, '').length !== 11) {
        error.textContent = 'CPF inválido. Use 11 dígitos.';
        return;
    }
    const usuarios = getUsuarios();
    if (usuarios.some(u => u.email === email)) {
        error.textContent = 'Este email já está cadastrado.';
        return;
    }

    usuarios.push({ nome, email, telefone, cpf: cpf.replace(/\D/g, ''), senha, lastOrderId: null });
    salvarUsuarios(usuarios);
    usuarioLogado = { nome, email, telefone, cpf: cpf.replace(/\D/g, ''), lastOrderId: null };
    salvarSessaoUsuario();
    atualizarCabecalhoUsuario();
    preencherFormularioDados();
    fecharCadastroModal();
    error.textContent = '';
    showToast('Conta criada com sucesso!');
    abrirDashboard();
}

function logoutUsuario() {
    usuarioLogado = null;
    salvarSessaoUsuario();
    atualizarCabecalhoUsuario();
    showToast('Você saiu da conta.');
    mudarView('cardapio');
    closeMenu();
}

function preencherFormularioDados() {
    if (!usuarioLogado) return;
    const nomeInput = document.getElementById('nome-cliente');
    const telefoneInput = document.getElementById('telefone');
    const cpfInput = document.getElementById('cpf-cliente');
    const enderecoInput = document.getElementById('endereco');

    if (nomeInput) nomeInput.value = usuarioLogado.nome || '';
    if (telefoneInput) telefoneInput.value = usuarioLogado.telefone || '';
    if (cpfInput) cpfInput.value = formatarCPF(usuarioLogado.cpf || '');
    if (enderecoInput) enderecoInput.value = enderecoInput.value || '';
}

function formatarCPF(value) {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3.$4');
}

function abrirDashboard() {
    if (!usuarioLogado) { abrirLoginModal(); return; }
    carregarDashboard();
}

function carregarDashboard() {
    if (!usuarioLogado) return;
    fetch(`${API_URL}/pedidos?user_email=${encodeURIComponent(usuarioLogado.email)}`)
        .then(r => r.json())
        .then(data => {
            if (!data.success) return;
            renderizarDashboard(data.pedidos || []);
            mudarView('dashboard');
        })
        .catch(() => showToast('Erro ao carregar seus pedidos.', 'erro'));
}

function renderizarDashboard(pedidos) {
    document.getElementById('perfil-nome').textContent = usuarioLogado.nome;
    document.getElementById('perfil-email').textContent = usuarioLogado.email;
    document.getElementById('perfil-cpf').textContent = `CPF: ${formatarCPF(usuarioLogado.cpf)}`;
    document.getElementById('perfil-telefone').textContent = `Telefone: ${usuarioLogado.telefone}`;

    const container = document.getElementById('usuario-pedidos');
    if (!pedidos || pedidos.length === 0) {
        container.innerHTML = `<div class="vazio">Você ainda não fez pedidos. Faça o primeiro agora!</div>`;
        return;
    }
    container.innerHTML = pedidos.map(p => `
        <div class="pedido-card user-card">
            <div class="card-top">
                <div class="card-id">Pedido <span>#${p.id.slice(0,8)}</span></div>
                <div class="card-badge ${p.status}">${p.status.replace('_', ' ')}</div>
            </div>
            <div class="card-body">
                <div class="card-cliente">Total R$ ${((p.total||0)+5).toFixed(2)}</div>
                <div class="card-telefone">${p.endereco || ''}</div>
                <div class="card-itens">${(p.itens || []).map(i => `${i.quantidade}x ${i.nome_produto}`).join(', ')}</div>
            </div>
            <div class="card-actions">
                <button class="btn btn-primary btn-block" onclick="carregarAcompanhamento('${p.id}', '${usuarioLogado?.email || ''}')">Acompanhar</button>
            </div>
        </div>
    `).join('');
}

function abrirAcompanhamento() {
    if (!usuarioLogado) { abrirLoginModal(); return; }
    const pedidoId = localStorage.getItem(ORDER_STORAGE_KEY) || usuarioLogado.lastOrderId;
    if (pedidoId) {
        carregarAcompanhamento(pedidoId, usuarioLogado.email);
    } else {
        abrirDashboard();
    }
}

function carregarAcompanhamento(pedidoId, userEmail = null) {
    const email = userEmail || usuarioLogado?.email || null;
    const query = email ? `?user_email=${encodeURIComponent(email)}` : '';
    fetch(`${API_URL}/pedidos/${pedidoId}${query}`)
    .then(r => r.json().then(data => ({ status: r.status, body: data })))
    .then(({ status, body }) => {
        if (status === 403) {
            showToast('Pedido não pertence à conta atual.', 'erro');
            return;
        }
        if (status === 404 || !body.success) {
            showToast(body.error || 'Pedido não encontrado. Verifique o código.', 'erro');
            return;
        }
        pedidoAtual = { ...pedidoAtual, ...body.pedido };
        renderizarAcompanhamento(pedidoAtual);
        mudarView('acompanhamento');
        if (socket) socket.emit('acompanhar_pedido', pedidoId);
    })
    .catch(() => {
        showToast('Erro de conexão ao buscar pedido. Tente novamente.', 'erro');
    });
}

// ===== CARDÁPIO =====
function carregarCardapio() {
    fetch(`${API_URL}/cardapio`)
        .then(res => res.json())
        .then(data => { cardapio = data.cardapio; renderizarCardapio('espetos'); })
        .catch(() => showToast('⚠️ Erro ao carregar cardápio. Backend offline?', 'erro'));
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
                <div class="produto-categoria-tag">${CATEGORIA_TAG[categoria] || ''}</div>
                <div class="produto-nome">${produto.nome}</div>
                <div class="produto-descricao">${produto.descricao || ''}</div>
                <div class="produto-footer">
                    <div class="produto-preco">R$&nbsp;${produto.preco.toFixed(2)}</div>
                    <div class="produto-actions">
                        <div class="produto-quantidade">
                            <label>Qtd</label>
                            <input type="number" value="1" min="1" class="quantidade-input" id="qtd-${produto.id}">
                        </div>
                        <button class="btn-add" onclick="adicionarAoCarrinho('${produto.id}','${produto.nome.replace(/'/g,"\\'")}',${produto.preco},'${categoria}')">+ Add</button>
                    </div>
                </div>
            </div>`;
        container.appendChild(card);
    });
}

function filtrarCardapio(categoria) {
    document.querySelectorAll('.btn-categoria').forEach(b => b.classList.remove('ativo'));
    event.target.classList.add('ativo');
    renderizarCardapio(categoria);
}

// ===== CARRINHO =====
function adicionarAoCarrinho(produtoId, nome, preco, categoria) {
    const input = document.getElementById(`qtd-${produtoId}`);
    const quantidade = parseInt(input?.value) || 1;
    const existe = carrinho.find(i => i.id === produtoId);
    if (existe) { existe.quantidade += quantidade; }
    else { carrinho.push({ id: produtoId, nome, preco, categoria, quantidade }); }
    atualizarCarrinho();
    showToast(`✅ ${nome} adicionado!`);
}

function atualizarCarrinho() {
    document.getElementById('carrinho-count').textContent = carrinho.reduce((s,i)=>s+i.quantidade,0);
    renderizarCarrinho();
}

function renderizarCarrinho() {
    const container = document.getElementById('carrinho-items');
    if (carrinho.length === 0) {
        container.innerHTML = '<div class="carrinho-vazio">🛒 Seu carrinho está vazio</div>';
        atualizarResumo(); return;
    }
    container.innerHTML = carrinho.map(item => `
        <div class="carrinho-item">
            <div class="carrinho-item-nome">${item.nome}</div>
            <div class="carrinho-item-quantidade">
                <button class="btn btn-secondary" style="padding:0.3rem 0.7rem;margin-top:0" onclick="diminuirQuantidade('${item.id}')">−</button>
                <input type="number" value="${item.quantidade}" onchange="atualizarQuantidade('${item.id}',this.value)" style="width:44px;padding:0.3rem;background:var(--dark3);border:1px solid var(--border2);border-radius:4px;color:var(--text);text-align:center;font-weight:700">
                <button class="btn" style="padding:0.3rem 0.7rem;margin-top:0" onclick="aumentarQuantidade('${item.id}')">+</button>
            </div>
            <div class="carrinho-item-preco">R$ ${(item.preco * item.quantidade).toFixed(2)}</div>
            <button onclick="removerDoCarrinho('${item.id}')" style="background:transparent;border:none;color:var(--text-muted);cursor:pointer;font-size:1.1rem;">✕</button>
        </div>`).join('');
    atualizarResumo();
}

function aumentarQuantidade(id) { const i=carrinho.find(x=>x.id===id); if(i) i.quantidade++; atualizarCarrinho(); }
function diminuirQuantidade(id) { const i=carrinho.find(x=>x.id===id); if(i&&i.quantidade>1) i.quantidade--; atualizarCarrinho(); }
function atualizarQuantidade(id, v) { const i=carrinho.find(x=>x.id===id); if(i) i.quantidade=Math.max(1,parseInt(v)||1); atualizarCarrinho(); }
function removerDoCarrinho(id) { carrinho=carrinho.filter(i=>i.id!==id); atualizarCarrinho(); }

function atualizarResumo() {
    const subtotal = carrinho.reduce((s,i)=>s+i.preco*i.quantidade,0);
    const taxa = carrinho.length > 0 ? 5 : 0;
    const total = subtotal + taxa;
    document.getElementById('subtotal').textContent = `R$ ${subtotal.toFixed(2)}`;
    document.getElementById('total').textContent = `R$ ${total.toFixed(2)}`;
    const ct = document.getElementById('checkout-total');
    if (ct) ct.textContent = `R$ ${total.toFixed(2)}`;
    const ci = document.getElementById('checkout-items');
    if (ci) ci.innerHTML = carrinho.map(i=>`
        <div class="checkout-item-row">
            <span>${i.nome} ×${i.quantidade}</span>
            <span>R$ ${(i.preco*i.quantidade).toFixed(2)}</span>
        </div>`).join('');
}

// ===== PAGAMENTO =====
function selecionarPagamento(forma) {
    formaPagamentoSelecionada = forma;
    document.querySelectorAll('.payment-option').forEach(el => el.classList.remove('ativo'));
    document.getElementById(`pay-${forma}`).classList.add('ativo');
    const trocoGroup = document.getElementById('troco-group');
    if (forma === 'dinheiro') {
        trocoGroup.style.display = 'block';
    } else {
        trocoGroup.style.display = 'none';
        document.getElementById('troco-para').value = '';
    }
}

// ===== NAVEGAÇÃO =====
function mudarView(v) {
    document.querySelectorAll('.view').forEach(el=>el.classList.remove('ativo'));
    document.getElementById(`view-${v}`).classList.add('ativo');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    closeMenu();
}
function abrirCarrinho() { atualizarCarrinho(); mudarView('carrinho'); }
function voltarCardapio() { mudarView('cardapio'); }
function voltarCarrinho() { mudarView('carrinho'); }
function irCheckout() {
    if (!carrinho.length) { showToast('Adicione itens ao carrinho','erro'); return; }
    atualizarResumo();
    selecionarPagamento('pix');
    mudarView('checkout');
}
function voltarCheckout() { mudarView('checkout'); }

// ===== PEDIDO =====
function confirmarPedido(event) {
    event.preventDefault();
    if (!usuarioLogado) { abrirLoginModal(); showToast('Faça login ou crie conta para finalizar o pedido','info'); return; }
    if (!carrinho.length) { showToast('Carrinho vazio','erro'); return; }
    const nome = document.getElementById('nome-cliente').value.trim();
    const endereco = document.getElementById('endereco').value.trim();
    const telefone = document.getElementById('telefone').value.trim();
    const cpf = document.getElementById('cpf-cliente').value.trim();
    if (!nome||!endereco||!telefone||!cpf) { showToast('Preencha todos os campos','erro'); return; }
    const cpfLimpo = cpf.replace(/\D/g, '');
    if (cpfLimpo.length !== 11) { showToast('CPF inválido','erro'); return; }

    const subtotal = carrinho.reduce((s,i)=>s+i.preco*i.quantidade,0);
    const total = subtotal + 5;
    const obs = document.getElementById('observacoes').value.trim();
    const trocoPara = document.getElementById('troco-para')?.value?.trim();

    if (formaPagamentoSelecionada === 'dinheiro' && trocoPara) {
        const trocoVal = parseFloat(trocoPara.replace(',','.'));
        if (trocoVal < total) {
            showToast(`Valor do troco (R$ ${trocoVal.toFixed(2)}) menor que o total (R$ ${total.toFixed(2)})`, 'erro');
            return;
        }
    }

    const pedidoData = {
        nome_cliente: nome,
        endereco,
        telefone,
        cpf: cpfLimpo,
        user_email: usuarioLogado?.email || null,
        forma_pagamento: formaPagamentoSelecionada,
        troco_para: trocoPara ? parseFloat(trocoPara.replace(',','.')) : null,
        itens: carrinho.map(i=>({ nome:i.nome, categoria:i.categoria, quantidade:i.quantidade, preco:i.preco, observacoes: obs })),
    }; 

    fetch(`${API_URL}/pedidos`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify(pedidoData),
    })
    .then(r=>r.json())
    .then(data => {
        if (data.success) {
            pedidoAtual = data.pedido;
            pedidoAtual._total = total;
            pedidoAtual._forma = formaPagamentoSelecionada;
            pedidoAtual._troco = trocoPara ? parseFloat(trocoPara.replace(',','.')) : null;
            localStorage.setItem(ORDER_STORAGE_KEY, pedidoAtual.id);
            usuarioLogado.lastOrderId = pedidoAtual.id;
            salvarSessaoUsuario();

            if (formaPagamentoSelecionada === 'pix') {
                mudarView('pagamento');
                iniciarPagamento(pedidoAtual.id, total);
            } else {
                confirmarPedidoPresencial(pedidoAtual, total);
            }
        } else { showToast('Erro ao criar pedido: '+data.error,'erro'); }
    })
    .catch(()=>showToast('Erro de conexão','erro'));
}

function confirmarPedidoPresencial(pedido, total) {
    const tempo = calcularTempoEstimado();
    exibirConfirmacao(pedido, total, tempo);
    mudarView('confirmacao');
    carrinho = [];
    atualizarCarrinho();
}

function calcularTempoEstimado() {
    const itens = pedidoAtual?.itens?.length || carrinho.length;
    const base = 25;
    const extra = Math.floor(itens / 3) * 5;
    return base + extra;
}

function exibirConfirmacao(pedido, total, tempo) {
    const forma = pedidoAtual._forma;
    const troco = pedidoAtual._troco;
    const trocoReceber = troco ? (troco - total).toFixed(2) : null;

    let pagamentoInfo = '';
    if (forma === 'cartao') {
        pagamentoInfo = `<div class="confirm-tag confirm-cartao">💳 Pagar com Cartão na entrega</div>`;
    } else if (forma === 'dinheiro') {
        pagamentoInfo = `
            <div class="confirm-tag confirm-dinheiro">💵 Pagar com Dinheiro na entrega</div>
            ${trocoReceber ? `<div class="confirm-troco">Troco para R$ ${parseFloat(troco).toFixed(2)} → você receberá <strong>R$ ${trocoReceber}</strong></div>` : ''}
        `;
    }

    document.getElementById('confirmacao-content').innerHTML = `
        <div class="confirmacao-icon">✅</div>
        <h2 class="confirmacao-titulo">Pedido Confirmado!</h2>
        <p class="confirmacao-sub">Seu pedido foi enviado para a cozinha</p>
        <div class="confirmacao-info">
            <div class="confirm-row"><span>Pedido</span><span>#${pedido.id.slice(0,8)}</span></div>
            <div class="confirm-row"><span>Total</span><span style="color:var(--primary);font-weight:900">R$ ${total.toFixed(2)}</span></div>
            <div class="confirm-row"><span>Entrega estimada</span><span>⏱ ${tempo}–${tempo+10} minutos</span></div>
            <div class="confirm-row"><span>Endereço</span><span style="font-size:0.85rem">${pedido.endereco}</span></div>
        </div>
        ${pagamentoInfo}
        <button class="btn btn-primary btn-block" style="margin-top:1.5rem" onclick="irParaAcompanhamento()">📍 Acompanhar Pedido</button>
        <button class="btn btn-secondary btn-block" onclick="voltarCardapio()">+ Fazer Novo Pedido</button>
    `;
}

function irParaAcompanhamento() {
    if (pedidoAtual) carregarAcompanhamento(pedidoAtual.id, usuarioLogado?.email);
}

// ===== PAGAMENTO PIX =====
function iniciarPagamento(pedidoId, total) {
    fetch(`${API_URL}/pagamentos`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ pedido_id: pedidoId }),
    })
    .then(r=>r.json())
    .then(data => {
        if (data.success) {
            exibirQRCode(data.payment.qrCode);
            exibirTotalPagamento(total);
            monitorarPagamento(pedidoId, data.payment.paymentId);
        } else { showToast('Erro ao gerar PIX: '+data.error,'erro'); }
    })
    .catch(()=>showToast('Erro ao iniciar pagamento','erro'));
}

function exibirQRCode(qrCode) {
    const container = document.getElementById('qr-code');
    container.innerHTML = '';
    if (qrCode && !qrCode.startsWith('mock_')) {
        new QRCode(container, { text: qrCode, width: 180, height: 180 });
    } else {
        container.innerHTML = `<div style="width:180px;height:180px;background:#f0f0f0;border-radius:8px;display:flex;align-items:center;justify-content:center;"><div style="font-size:2rem">📱</div></div>`;
    }
}

function exibirTotalPagamento(total) {
    const el = document.getElementById('pix-total');
    if (el) el.textContent = `R$ ${total.toFixed(2)}`;
}

function monitorarPagamento(pedidoId, paymentId) {
    const statusDiv = document.getElementById('pagamento-status');
    const intervalo = setInterval(() => {
        fetch(`${API_URL}/pagamentos/${paymentId}`)
        .then(r=>r.json())
        .then(data => {
            if (data.success && data.status.status === 'approved') {
                clearInterval(intervalo);
                if (statusDiv) statusDiv.innerHTML = '✅ Pagamento aprovado! Redirecionando...';
                atualizarStatusPedido(pedidoId, 'pago');
                setTimeout(() => {
                    const tempo = calcularTempoEstimado();
                    exibirConfirmacao(pedidoAtual, pedidoAtual._total || 0, tempo);
                    mudarView('confirmacao');
                    carrinho = [];
                    atualizarCarrinho();
                }, 1500);
            }
        }).catch(()=>{});
    }, 3000);
    setTimeout(()=>clearInterval(intervalo), 300000);
}

// ===== ACOMPANHAMENTO =====
function renderizarAcompanhamento(pedido) {
    const statusOrder = ['aguardando_pagamento','pago','em_preparo','pronto','saiu_entrega','entregue'];
    const infoDiv = document.getElementById('pedido-info');
    infoDiv.innerHTML = `
        <div class="pedido-info-item"><span class="pedido-info-label">Pedido</span><span class="pedido-info-value">#${pedido.id.slice(0,8)}</span></div>
        <div class="pedido-info-item"><span class="pedido-info-label">Cliente</span><span class="pedido-info-value">${pedido.nome_cliente}</span></div>
        <div class="pedido-info-item"><span class="pedido-info-label">CPF</span><span class="pedido-info-value">${pedido.cpf || '---'}</span></div>
        <div class="pedido-info-item"><span class="pedido-info-label">Total</span><span class="pedido-info-value" style="color:var(--primary)">R$ ${((pedido.total||0)+5).toFixed(2)}</span></div>
        <div class="pedido-info-item"><span class="pedido-info-label">Itens</span><span class="pedido-info-value">${pedido.itens?.length||0} item(s)</span></div>
        <div class="pedido-info-item"><span class="pedido-info-label">Endereço</span><span class="pedido-info-value">${pedido.endereco || ''}</span></div>
    `;
    statusOrder.forEach(status => {
        const el = document.getElementById(`status-${status}`);
        if (!el) return;
        el.classList.remove('ativo','completo');
        if (status === pedido.status) el.classList.add('ativo');
        else if (statusOrder.indexOf(status) < statusOrder.indexOf(pedido.status)) el.classList.add('completo');
    });
    renderizarAvaliacao(pedido);
}

function renderizarAvaliacao(pedido) {
    const box = document.getElementById('avaliacao-box');
    if (!pedido || pedido.status !== 'entregue') {
        if (box) box.style.display = 'none';
        return;
    }
    if (box) box.style.display = 'block';
    const comentario = pedido.avaliacao_comentario || '';
    box.innerHTML = `
        <div class="avaliacao-title">Avalie seu pedido</div>
        <div class="avaliacao-sub">Conte para nós como foi a sua experiência</div>
        <div class="avaliacao-stars" id="avaliacao-stars">
            ${[1,2,3,4,5].map(n => `<button type="button" class="estrela" onclick="selecionarEstrela(${n})">★</button>`).join('')}
        </div>
        <div class="form-group">
            <label>Comentário</label>
            <textarea id="avaliacao-comentario" placeholder="O que achou do pedido?">${comentario}</textarea>
        </div>
        <button type="button" class="btn btn-primary btn-block" onclick="enviarAvaliacao()">Enviar avaliação</button>
    `;
}

function selecionarEstrela(n) {
    ratingSelecionado = n;
    document.querySelectorAll('.estrela').forEach((btn, idx) => btn.classList.toggle('ativo', idx < n));
}

function enviarAvaliacao() {
    if (!pedidoAtual || !pedidoAtual.id) return;
    const estrela = ratingSelecionado || document.querySelectorAll('.estrela.ativo').length;
    if (estrela < 1) { showToast('Escolha pelo menos 1 estrela', 'erro'); return; }
    const comentario = document.getElementById('avaliacao-comentario').value.trim();
    fetch(`${API_URL}/pedidos/${pedidoAtual.id}/avaliacao`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estrela, comentario }),
    })
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            pedidoAtual.avaliacao_estrela = estrela;
            pedidoAtual.avaliacao_comentario = comentario;
            showToast('Obrigado pela avaliação!');
            renderizarAvaliacao(pedidoAtual);
        }
    })
    .catch(() => showToast('Erro ao enviar avaliação', 'erro'));
}

function atualizarStatusPedido(pedidoId, novoStatus) {
    fetch(`${API_URL}/pedidos/${pedidoId}/status`, {
        method:'PUT', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ status: novoStatus }),
    }).catch(()=>{});
}

function abrirAcompanhamentoModal() {
    const modal = document.getElementById('pedido-modal');
    if (modal) modal.style.display = 'flex';
    const saved = localStorage.getItem(ORDER_STORAGE_KEY);
    if (saved) document.getElementById('pedido-id-input').value = saved;
}

function fecharModalPedido() {
    document.getElementById('pedido-modal').style.display = 'none';
}

function consultarPedidoPorId() {
    const pedidoId = document.getElementById('pedido-id-input').value.trim();
    if (!pedidoId) { showToast('Digite o código do pedido', 'erro'); return; }
    fecharModalPedido();
    carregarAcompanhamento(pedidoId, usuarioLogado?.email);
}

// ===== SOCKET.IO =====
function conectarSocket() {
    const socketUrl = window.location.port === '5000'
        ? `${window.location.protocol}//${window.location.hostname}:3000`
        : window.location.origin;
    socket = io(socketUrl, { reconnection: true });
    socket.on('connect', ()=>console.log('🔌 Socket conectado'));
    socket.on('status_atualizado', data => {
        if (pedidoAtual && pedidoAtual.id === data.pedidoId) {
            pedidoAtual.status = data.status;
            renderizarAcompanhamento(pedidoAtual);
        }
    });
}

// ===== TOAST =====
function showToast(msg, tipo='ok') {
    const tc = document.getElementById('toast-container');
    if (!tc) return;
    const t = document.createElement('div');
    t.className = 'toast';
    if (tipo === 'erro') t.classList.add('erro');
    t.textContent = msg;
    tc.appendChild(t);
    setTimeout(()=>t.remove(), 3500);
}