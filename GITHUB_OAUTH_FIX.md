# 🔧 Configuração GitHub OAuth App - GUIA COMPLETO

## ❌ Problema Identificado
A URL de autorização está retornando 404, indicando problema com a configuração do GitHub OAuth App.

## ✅ Solução Passo a Passo

### 1. Verificar Client ID
- **Client ID Correto**: `Ov23lizvhhJM3ueDoymL` (com O maiúsculo)
- **URL de Configuração**: https://github.com/settings/applications/3187602

### 2. Gerar Client Secret Válido
1. Acesse: https://github.com/settings/applications/3187602
2. Clique em "Generate a new client secret"
3. Copie o secret gerado
4. Configure no arquivo `.env`:

```bash
GITHUB_CLIENT_ID=Ov23lizvhhJM3ueDoymL
GITHUB_CLIENT_SECRET=seu-client-secret-real-aqui
```

### 3. Verificar Authorization Callback URL
- **URL Correta**: `http://localhost:3003/github/callback`
- **Homepage URL**: `http://localhost:5000`

### 4. Testar Configuração
```bash
# 1. Criar arquivo .env
cp env-config-example.txt .env

# 2. Editar .env com suas credenciais reais
# 3. Reiniciar backend
npm run start:dev

# 4. Testar no frontend
# Acesse: http://localhost:5000/settings
# Vá para aba "Integrações"
# Clique em "Conectar" no GitHub
```

## 🔍 Debugging
Se ainda houver problemas:

1. **Verificar logs do backend**:
   ```bash
   # Procurar por logs do GitHub OAuth
   tail -f backend.log | grep -i github
   ```

2. **Testar URL manualmente**:
   ```bash
   ./test-github-url.sh
   ```

3. **Verificar configuração do GitHub**:
   - Client ID: `Ov23lizvhhJM3ueDoymL`
   - Client Secret: Deve ser um valor real (não "Never used")
   - Callback URL: `http://localhost:3003/github/callback`

## ⚠️ Problemas Comuns
- **Client ID incorreto**: Usar "0" (zero) em vez de "O" (maiúsculo)
- **Client Secret não configurado**: Usar secret real do GitHub
- **Callback URL incorreta**: Deve apontar para o backend
- **CORS**: Frontend e backend em portas diferentes

## 🎯 Próximos Passos
1. Gerar Client Secret real no GitHub
2. Configurar no arquivo .env
3. Reiniciar backend
4. Testar conexão no frontend
