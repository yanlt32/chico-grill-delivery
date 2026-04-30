# 🍔 CHICO GRILL Delivery

Sistema completo de delivery online minimalista para a hamburgueria CHICO GRILL.

## 🎯 Funcionalidades

✅ **Cliente**
- Visualizar cardápio completo
- Adicionar itens ao carrinho
- Finalizar pedido com dados de entrega
- Pagar via Mercado Pago (Pix/Cartão)
- Acompanhar status do pedido em tempo real

✅ **Cozinha**
- Receber pedidos pagos automaticamente
- Marcar pedidos como "Em Preparo"
- Marcar pedidos como "Pronto"

✅ **Motoboy**
- Ver pedidos prontos para entrega
- Marcar como "Saiu para Entrega"
- Confirmar entrega

✅ **Tempo Real**
- Socket.IO para atualizações instantâneas
- Notificações em tempo real
- Atualização automática do status

## 🛠️ Tecnologias

- **Backend**: Node.js + Express
- **Banco de Dados**: PostgreSQL
- **Tempo Real**: Socket.IO
- **Pagamento**: Mercado Pago
- **Frontend**: HTML5 + CSS3 + JavaScript

## 📁 Estrutura

```
chico-grill-delivery/
├── backend/              # Servidor Express + API
│   ├── src/
│   │   ├── server.js    # Servidor principal
│   │   ├── config/      # Configurações (DB, Mercado Pago)
│   │   ├── models/      # Modelos de dados
│   │   ├── routes/      # Rotas da API
│   │   ├── services/    # Serviços
│   │   └── middleware/  # Middlewares
│   ├── package.json
│   └── .env.example
├── frontend/            # Cliente web
│   ├── index.html
│   ├── styles.css
│   ├── app.js
│   └── assets/
├── admin/              # Painéis administrativos
│   ├── cozinha.html
│   ├── motoboy.html
│   ├── styles.css
│   ├── cozinha.js
│   └── motoboy.js
└── README.md
```

## 🚀 Como Usar

### 1. Clonar e Instalar

```bash
git clone <seu-repositorio>
cd chico-grill-delivery
```

### 2. Configurar Backend

```bash
cd backend
npm install
cp .env.example .env
```

Editar `.env` com suas configurações:
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=sua_senha
DB_NAME=chico_grill_delivery
PORT=3000
MERCADO_PAGO_TOKEN=seu_token
```

### 3. Criar Banco de Dados

```bash
npm run setup-db
```

### 4. Iniciar Backend

```bash
npm run dev
```

O servidor rodará em `http://localhost:3000`

### 5. Usar Frontend

Abrir em navegador:
- **Cliente**: `http://localhost:5000` (ou abrir `frontend/index.html`)
- **Cozinha**: `http://localhost:5000/admin/cozinha.html`
- **Motoboy**: `http://localhost:5000/admin/motoboy.html`

## 📋 Cardápio

### 🔥 Espetos (R$ 6-10)
- Carne, Misto, Kafta, Coração, Tulipa, Panceta, Pão de Alho, Frango, Queijo Coalho, Linguiça

### 🍔 Burgers (R$ 14-47)
- Lanche de Espeto até Big Bony (quádruplo)

### 🥤 Bebidas (R$ 3-9)
- Cervejas e refrigerantes

## 💳 Fluxo de Pagamento

1. Cliente finaliza pedido
2. Sistema cria pagamento no Mercado Pago
3. QR Code Pix é exibido (ou opção de cartão)
4. Webhook confirma pagamento
5. Status atualiza para "Pago"
6. Pedido vai para cozinha automaticamente

## 🔄 Fluxo de Status

```
Aguardando Pagamento
       ↓
      Pago (notifica cozinha)
       ↓
  Em Preparo
       ↓
     Pronto (notifica motoboy)
       ↓
  Saiu para Entrega
       ↓
    Entregue
```

## 🔌 API Endpoints

### Pedidos
- `GET /api/pedidos` - Listar todos
- `GET /api/pedidos/:id` - Obter por ID
- `POST /api/pedidos` - Criar novo
- `PUT /api/pedidos/:id/status` - Atualizar status

### Pagamentos
- `POST /api/pagamentos` - Criar pagamento
- `GET /api/pagamentos/:paymentId` - Verificar status
- `POST /api/pagamentos/webhook` - Webhook Mercado Pago

### Cardápio
- `GET /api/cardapio` - Obter cardápio completo

## ⚙️ Socket.IO Events

### Cliente
- `acompanhar_pedido` - Começar a acompanhar pedido
- `sair_acompanhamento` - Parar de acompanhar

### Cozinha
- `conectar_cozinha` - Conectar painel cozinha
- `novo_pedido` - Notificação de pedido novo

### Motoboy
- `conectar_motoboy` - Conectar painel entrega
- `pedido_pronto` - Notificação de pedido pronto

### Broadcast
- `status_atualizado` - Notifica todos sobre mudança

## 📊 Banco de Dados

### Tabelas

**pedidos**
- id (UUID)
- nome_cliente
- endereco
- telefone
- status
- total
- payment_id
- payment_status
- created_at
- updated_at

**itens_pedido**
- id (UUID)
- pedido_id
- nome_produto
- categoria
- quantidade
- preco_unitario
- observacoes
- created_at

**historico_status**
- id (UUID)
- pedido_id
- status_anterior
- status_novo
- updated_by
- created_at

## 🔐 Segurança

- ✅ Validação de dados no backend
- ✅ Proteção contra SQL injection (pg prepared statements)
- ✅ CORS configurado
- ✅ Webhook Mercado Pago verificado
- ✅ IDs únicos (UUID) para pedidos

## 📱 Responsivo

- ✅ Mobile first
- ✅ Desktop otimizado
- ✅ Tablet suportado

## 🎨 Design

Cores da identidade CHICO GRILL:
- Primária: #d63031 (vermelho)
- Secundária: #f39c12 (laranja)
- Dark: #2d3436

## 📝 Variáveis de Ambiente

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=senha
DB_NAME=chico_grill_delivery
PORT=3000
NODE_ENV=development
MERCADO_PAGO_TOKEN=seu_token
MERCADO_PAGO_PUBLIC_KEY=sua_key
WEBHOOK_URL=http://localhost:3000/webhook
FRONTEND_URL=http://localhost:5000
```

## 🚀 Deploy

### Heroku
1. Adicionar Procfile
2. Configurar add-on PostgreSQL
3. Definir variáveis de ambiente
4. Deploy via git

### DigitalOcean / AWS
1. Criar instância Ubuntu
2. Instalar Node.js e PostgreSQL
3. Clonar repositório
4. Configurar PM2 para manter processo ativo
5. Usar Nginx como reverse proxy

## 📄 Licença

MIT

## 👨‍💼 Desenvolvido para

**CHICO GRILL** 🍔
