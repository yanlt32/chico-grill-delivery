# 🚀 GUIA DE DEPLOY NA RENDER

## 📋 O que você precisa

1. Conta na Render: https://render.com
2. Repositório GitHub com o projeto
3. Mercado Pago Token (se usar pagamentos)

## 🔧 Passo 1: Conectar GitHub

1. Login no Render: https://dashboard.render.com
2. Clique em "New +" → "Web Service"
3. Selecione seu repositório do GitHub
4. Autorize a Render

## ⚙️ Passo 2: Configurar Serviço

**Name**: `chico-grill-api`

**Environment**: `Node`

**Build Command**:
```
cd backend && npm install
```

**Start Command**:
```
npm start
```

**Root Directory**: `backend`

## 🗄️ Passo 3: PostgreSQL na Render

### Opção A: PostgreSQL Gerenciado (Recomendado)

1. No dashboard Render, clique "New +" → "PostgreSQL"
2. Name: `chico-grill-db`
3. Database: `chico_grill_delivery`
4. User: `postgres`
5. Deixar as outras configurações padrão
6. Criar

A Render vai gerar a URL de conexão automaticamente.

### Opção B: Usar Banco Externo

Se já tem PostgreSQL:
1. Use a string de conexão do seu banco

## 🌍 Passo 4: Environment Variables

No dashboard do Render, na seção "Environment":

```
DB_HOST=seu-host-render.render.com
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=sua_senha_gerada
DB_NAME=chico_grill_delivery
PORT=3000
NODE_ENV=production
MERCADO_PAGO_TOKEN=seu_token_aqui
MERCADO_PAGO_PUBLIC_KEY=sua_public_key_aqui
FRONTEND_URL=https://seu-frontend.com
```

## 📱 Passo 5: Deploy Frontend

### Opção A: Render Static Site

1. "New +" → "Static Site"
2. Conectar seu repositório
3. **Build Command**: (deixar vazio)
4. **Publish Directory**: `frontend`
5. Deploy

### Opção B: Netlify

1. Conectar GitHub: https://netlify.com
2. Selecionar repositório
3. Base directory: `/frontend`
4. Publish directory: `/frontend`
5. Deploy

### Opção C: GitHub Pages

1. Ir em Settings → Pages
2. Source: Deploy from a branch
3. Branch: main, folder: /frontend
4. Salvar

## 🔗 Conectar Frontend ao Backend

No arquivo `frontend/app.js`, mudar:

```javascript
const API_URL = 'https://seu-chico-grill-api.onrender.com/api';
```

## 📊 Atualizações do Banco

Depois do deploy, criar as tabelas:

```bash
# SSH na Render
render deploy chico-grill-api

# Ou via Node Console na Render:
node src/config/database.js
```

## ✅ Checklist de Deploy

- [ ] Repositório GitHub atualizado
- [ ] Variáveis de ambiente configuradas
- [ ] PostgreSQL conectado
- [ ] Domínio customizado (opcional)
- [ ] SSL/HTTPS ativado (automático no Render)
- [ ] Frontend apontando para API correta
- [ ] Mercado Pago tokens válidos
- [ ] Testes de pagamento feitos

## 🎯 URLs Finais

```
API Backend: https://chico-grill-api.onrender.com
Frontend Cliente: https://chico-grill-cliente.netlify.app
Admin Cozinha: https://chico-grill-cozinha.netlify.app
Admin Entrega: https://chico-grill-entrega.netlify.app
```

## 🔄 CI/CD Automático

Render faz redeploy automático quando você faz:

```bash
git push origin main
```

## 🐛 Debugging

Ver logs na Render:
1. Dashboard → seu serviço
2. Aba "Logs"
3. Procurar erros

## 💡 Dicas

- Use variáveis de ambiente diferentes para dev e prod
- Teste localmente antes de fazer push
- Backup regular do banco PostgreSQL
- Monitore performance na Render

## 📞 Suporte

- Docs Render: https://render.com/docs
- GitHub Issues para bugs

---

**Pronto para subir? Boa sorte!** 🚀
