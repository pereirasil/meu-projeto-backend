# 🚀 INSTRUÇÕES PARA TESTAR A INTEGRAÇÃO COM GITHUB

## ✅ O que já está pronto:
- ✅ OAuth App criada no GitHub (ID: 3187555)
- ✅ Backend com todas as rotas implementadas
- ✅ Frontend com interface de integração
- ✅ Fluxo OAuth completo implementado

## 🔧 O que você precisa fazer:

### 1. Obter as credenciais da sua OAuth App
1. Acesse: https://github.com/settings/applications/3187555
2. Copie o **Client ID** e **Client Secret**

### 2. Configurar as credenciais no backend

**Opção A - Arquivo .env (Recomendado):**
```bash
# Crie um arquivo .env na raiz do projeto backend
cd /Users/andersonpereira/apps/meu-projeto-backend
nano .env
```

Cole o seguinte conteúdo (substitua pelos valores reais):
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=trello_db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-2024

# GitHub OAuth Configuration
GITHUB_CLIENT_ID=seu-client-id-real
GITHUB_CLIENT_SECRET=seu-client-secret-real

# Application Configuration
NODE_ENV=development
PORT=3003
```

**Opção B - Variáveis de ambiente:**
```bash
export GITHUB_CLIENT_ID='seu-client-id-real'
export GITHUB_CLIENT_SECRET='seu-client-secret-real'
```

### 3. Reiniciar o backend
```bash
cd /Users/andersonpereira/apps/meu-projeto-backend
npm run start:dev
```

### 4. Testar a integração
1. Acesse: http://localhost:5000
2. Faça login
3. Vá em Configurações > Integrações
4. Clique em "Conectar GitHub"
5. Autorize o aplicativo no GitHub
6. Veja os dados do GitHub sendo exibidos

## 🎯 URLs configuradas na sua OAuth App:
- **Homepage URL**: http://localhost:5000
- **Authorization callback URL**: http://localhost:5000/settings

## 🔍 Como verificar se está funcionando:
- O backend deve mostrar logs de sucesso
- O frontend deve exibir o avatar e username do GitHub
- Não deve haver erros de "invalid client" ou "unauthorized"

## 🆘 Se der erro:
1. Verifique se as credenciais estão corretas
2. Verifique se o callback URL está exatamente: `http://localhost:5000/settings`
3. Verifique se ambos os projetos estão rodando (backend na 3003, frontend na 5000)
4. Verifique os logs do backend para erros específicos

