# 🔧 CONFIGURAÇÃO PARA PRODUÇÃO - GITHUB OAUTH

## 📋 RESUMO DAS ALTERAÇÕES

### ✅ O que já está funcionando em produção:
- Backend rodando com PM2
- Banco de dados configurado
- Autenticação JWT funcionando
- Todas as outras funcionalidades

### 🆕 O que adicionamos:
- Integração com GitHub OAuth
- Novos endpoints para GitHub
- Frontend atualizado para usar URLs dinâmicas

## 🔐 VARIÁVEIS DE AMBIENTE NECESSÁRIAS

**APENAS essas 2 variáveis precisam ser adicionadas em produção:**

```bash
GITHUB_CLIENT_ID=Ov23lizvhhJM3ueDoymL
GITHUB_CLIENT_SECRET=81cdef78ba4592c5bb11836997c92163c8305005
```

## 🚀 COMO CONFIGURAR EM PRODUÇÃO

### Opção 1: Via PM2 (Recomendado)
```bash
# Conectar ao servidor
ssh root@191.252.177.174

# Ir para o diretório do projeto
cd /var/www/timeboard/votacao-backend

# Configurar as variáveis no PM2
pm2 set GITHUB_CLIENT_ID "Ov23lizvhhJM3ueDoymL"
pm2 set GITHUB_CLIENT_SECRET "81cdef78ba4592c5bb11836997c92163c8305005"

# Reiniciar a aplicação
pm2 restart votacao-backend
```

### Opção 2: Via arquivo .env
```bash
# Criar/editar arquivo .env
echo "GITHUB_CLIENT_ID=Ov23lizvhhJM3ueDoymL" >> .env
echo "GITHUB_CLIENT_SECRET=81cdef78ba4592c5bb11836997c92163c8305005" >> .env

# Reiniciar a aplicação
pm2 restart votacao-backend
```

## 🔍 VERIFICAÇÃO

Após configurar, teste se está funcionando:

```bash
# Testar endpoint de verificação
curl https://api.timeboard.site/github/env-check

# Deve retornar algo como:
# {
#   "success": true,
#   "environment": "production",
#   "github": {
#     "hasClientId": true,
#     "hasClientSecret": true,
#     "clientIdMasked": "Ov23****",
#     "clientSecretMasked": "81cd****"
#   }
# }
```

## ⚠️ IMPORTANTE

- **NÃO** altere outras variáveis de ambiente existentes
- **NÃO** remova configurações que já estão funcionando
- Apenas **ADICIONE** essas 2 variáveis do GitHub
- O deploy automático já está configurado para verificar essas variáveis

## 📝 CHECKLIST FINAL

- [ ] Configurar GITHUB_CLIENT_ID em produção
- [ ] Configurar GITHUB_CLIENT_SECRET em produção  
- [ ] Reiniciar aplicação com PM2
- [ ] Testar endpoint /github/env-check
- [ ] Testar integração GitHub no frontend
