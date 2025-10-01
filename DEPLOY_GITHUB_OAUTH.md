# 🚀 INSTRUÇÕES PARA CONFIGURAR GITHUB OAUTH EM PRODUÇÃO

## 📋 O que foi atualizado no deploy

O workflow de deploy foi atualizado para incluir:
- ✅ Build de produção (`yarn build`)
- ✅ Verificação das variáveis de ambiente do GitHub OAuth
- ✅ Inicialização com PM2 usando o build compilado (`dist/main.js`)

## 🔧 Configurações necessárias no servidor

### 1. GitHub OAuth App de Produção

1. Acesse: https://github.com/settings/applications
2. Crie uma nova OAuth App ou edite a existente
3. Configure:
   - **Application name**: `TimeBoard - Produção`
   - **Homepage URL**: `https://timeboard.site`
   - **Authorization callback URL**: `https://api.timeboard.site/github/callback`

### 2. Variáveis de Ambiente no Servidor

Execute no servidor (191.252.177.174):

```bash
# Configurar variáveis de ambiente do GitHub OAuth
export GITHUB_CLIENT_ID="seu_client_id_de_producao"
export GITHUB_CLIENT_SECRET="seu_client_secret_de_producao"

# Para tornar permanente, adicione ao arquivo de perfil
echo 'export GITHUB_CLIENT_ID="seu_client_id_de_producao"' >> ~/.bashrc
echo 'export GITHUB_CLIENT_SECRET="seu_client_secret_de_producao"' >> ~/.bashrc

# Ou configure no PM2 ecosystem
pm2 set pm2:env GITHUB_CLIENT_ID "seu_client_id_de_producao"
pm2 set pm2:env GITHUB_CLIENT_SECRET "seu_client_secret_de_producao"
```

### 3. Verificar Configuração

Após o deploy, verifique se está funcionando:

```bash
# Verificar se as variáveis estão configuradas
echo $GITHUB_CLIENT_ID
echo $GITHUB_CLIENT_SECRET

# Verificar logs do PM2
pm2 logs votacao-backend

# Testar endpoint GitHub
curl https://api.timeboard.site/github/debug
```

## 🎯 URLs de Produção

- **Frontend**: https://timeboard.site
- **Backend API**: https://api.timeboard.site
- **GitHub Callback**: https://api.timeboard.site/github/callback

## ✅ Checklist de Deploy

- [ ] GitHub OAuth App criado/configurado
- [ ] Variáveis de ambiente configuradas no servidor
- [ ] Deploy executado via GitHub Actions
- [ ] Teste da integração GitHub funcionando
- [ ] Logs verificados sem erros

## 🔍 Troubleshooting

Se houver problemas:

1. **Verificar logs**: `pm2 logs votacao-backend`
2. **Verificar variáveis**: `pm2 env`
3. **Reiniciar serviço**: `pm2 restart votacao-backend`
4. **Verificar build**: `ls -la dist/`

## 📞 Suporte

Se precisar de ajuda, verifique:
- Logs do GitHub Actions no repositório
- Logs do PM2 no servidor
- Configuração das variáveis de ambiente
