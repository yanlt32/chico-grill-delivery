# 🚀 GUIA DE INSTALAÇÃO E USO

## 📋 Pré-requisitos

- Node.js 16+ 
- npm 8+
- PostgreSQL 12+
- (Opcional) Docker

## ⚡ Quick Start com Docker

```bash
# 1. Clonar
git clone <repo>
cd chico-grill-delivery

# 2. Criar .env
cp backend/.env.example backend/.env

# 3. Rodar com Docker
docker-compose up

# 4. Criar tabelas
docker exec chico-grill-delivery-backend-1 npm run setup-db

# 5. Acessar
# Cliente: http://localhost/frontend/index.html
# Cozinha: http://localhost/admin/cozinha.html
# Motoboy: http://localhost/admin/motoboy.html
```

## 🛠️ Instalação Manual

### Passo 1: Instalar Dependências

```bash
cd backend
npm install
```

### Passo 2: Configurar Banco de Dados

```bash
# Criar banco no PostgreSQL
createdb chico_grill_delivery

# Ou usar pgAdmin
```

### Passo 3: Configurar Variáveis

Copiar `.env.example` para `.env`:
```bash
cp .env.example .env
```

Editar `.env` com suas informações:
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=sua_senha_postgres
DB_NAME=chico_grill_delivery
PORT=3000
MERCADO_PAGO_TOKEN=seu_token_aqui
```

### Passo 4: Criar Tabelas

```bash
npm run setup-db
```

### Passo 5: Iniciar Backend

```bash
npm run dev
```

Deve aparecer:
```
✅ Servidor rodando em http://localhost:3000
📡 WebSocket ativo em ws://localhost:3000
```

### Passo 6: Abrir Frontend

Em outro terminal:
```bash
# Opção 1: Usar Python (se tiver)
cd frontend
python -m http.server 5000

# Opção 2: Usar Node + http-server
npm install -g http-server
cd frontend
http-server -p 5000

# Opção 3: Abrir diretamente no navegador
# Abrir: file:///caminho/para/chico-grill-delivery/frontend/index.html
```

Depois acesse:
- Cliente: http://localhost:5000
- Cozinha: http://localhost:5000/admin/cozinha.html
- Motoboy: http://localhost:5000/admin/motoboy.html

## 🧪 Testando o Sistema

### 1. Testar Cardápio
```
GET http://localhost:3000/api/cardapio
```

Deve retornar cardápio completo.

### 2. Criar Pedido de Teste

```bash
curl -X POST http://localhost:3000/api/pedidos \
  -H "Content-Type: application/json" \
  -d '{
    "nome_cliente": "João Silva",
    "endereco": "Rua Teste 123, Apt 456",
    "telefone": "(00) 9 9999-9999",
    "itens": [
      {
        "nome": "Carne",
        "categoria": "espetos",
        "quantidade": 2,
        "preco": 10.0
      },
      {
        "nome": "Refrigerante",
        "categoria": "bebidas",
        "quantidade": 1,
        "preco": 6.0
      }
    ]
  }'
```

Retorno esperado:
```json
{
  "success": true,
  "pedido": {
    "id": "uuid-aqui",
    "nome_cliente": "João Silva",
    "status": "aguardando_pagamento",
    "total": 26.0,
    ...
  }
}
```

### 3. Atualizar Status Pedido

```bash
curl -X PUT http://localhost:3000/api/pedidos/seu-pedido-id/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "pago"
  }'
```

## 📱 Usando o Sistema

### Como Cliente

1. Abrir http://localhost:5000
2. Selecionar categoria (Espetos, Burgers, Bebidas)
3. Adicionar itens ao carrinho
4. Clicar "Ir para Checkout"
5. Preencher dados (nome, endereço, telefone)
6. Confirmar pedido
7. QR Code será exibido (para produção usar Mercado Pago real)
8. Acompanhar em tempo real

### Como Cozinha

1. Abrir http://localhost:5000/admin/cozinha.html
2. Ver pedidos pagos em "Novos Pedidos"
3. Clicar "🔥 Iniciar Preparo"
4. Clicar "✅ Pronto" quando terminar

### Como Motoboy

1. Abrir http://localhost:5000/admin/motoboy.html
2. Ver pedidos em "Prontos para Entrega"
3. Clicar "🛵 Saiu para Entrega"
4. Clicar "✔️ Entregue" quando entregar

## 🔧 Troubleshooting

### Erro: "ECONNREFUSED" no Banco

```
❌ Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solução**: Verificar se PostgreSQL está rodando
```bash
# Windows
pg_ctl start -D "C:\Program Files\PostgreSQL\15\data"

# Mac
brew services start postgresql

# Linux
sudo systemctl start postgresql
```

### Erro: "Cannot find module 'pg'"

```bash
npm install pg dotenv express socket.io cors axios uuid
```

### Socket.IO não conectando

1. Verificar se backend está rodando
2. Verificar URL no `app.js` do frontend
3. Limpar cache do navegador (Ctrl+Shift+Delete)
4. Checar console do navegador (F12) para erros

### Banco vazio após iniciar

Rodar:
```bash
npm run setup-db
```

## 📊 Verificar Status

```bash
# Todos os pedidos
curl http://localhost:3000/api/pedidos

# Pedido específico
curl http://localhost:3000/api/pedidos/seu-id

# Cardápio
curl http://localhost:3000/api/cardapio

# Health check
curl http://localhost:3000/health
```

## 🔑 Integração Mercado Pago (Produção)

1. Criar conta em https://www.mercadopago.com.br
2. Acessar: Ferramentas → Credenciais
3. Copiar Access Token e Public Key
4. Adicionar ao `.env`:
```
MERCADO_PAGO_TOKEN=APP_USR_seu_token
MERCADO_PAGO_PUBLIC_KEY=APP_USR_sua_key
```

## 📝 Estrutura de Pastas

```
chico-grill-delivery/
├── backend/
│   ├── src/
│   │   ├── server.js          ← Servidor principal
│   │   ├── config/
│   │   │   ├── database.js     ← Conexão PostgreSQL
│   │   │   └── mercadopago.js  ← Integração pagamento
│   │   ├── models/
│   │   │   └── Pedido.js       ← Modelo de dados
│   │   └── routes/
│   │       ├── pedidos.js      ← API de pedidos
│   │       └── pagamentos.js   ← API de pagamentos
│   ├── package.json
│   ├── .env.example
│   └── Dockerfile
├── frontend/
│   ├── index.html              ← App do cliente
│   ├── app.js                  ← Lógica do cliente
│   └── styles.css              ← Estilos
├── admin/
│   ├── cozinha.html            ← Painel cozinha
│   ├── cozinha.js
│   ├── motoboy.html            ← Painel entrega
│   ├── motoboy.js
│   └── styles.css
├── docker-compose.yml          ← Containers
├── README.md                   ← Este arquivo
└── .gitignore
```

## 🚀 Próximas Etapas

- [ ] Autenticação de usuários
- [ ] Dashboard administrativo
- [ ] Histórico de pedidos
- [ ] Relatórios e estatísticas
- [ ] Integração com SMS
- [ ] App mobile (React Native)
- [ ] Sistema de ratings
- [ ] Promoções e cupons
- [ ] Integração com Google Maps

## ❓ Dúvidas?

Verificar logs no terminal onde rodou o servidor.
