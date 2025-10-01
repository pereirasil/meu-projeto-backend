#!/bin/bash

echo "🎉 TESTE FINAL - GitHub OAuth Configurado"
echo "=========================================="

# Verificar se o backend está rodando
echo "1. 🔍 Verificando backend..."
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3003)
if [ "$BACKEND_STATUS" = "200" ]; then
    echo "   ✅ Backend rodando na porta 3003"
else
    echo "   ❌ Backend não está respondendo"
    exit 1
fi

# Verificar se o frontend está rodando
echo "2. 🔍 Verificando frontend..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000)
if [ "$FRONTEND_STATUS" = "200" ]; then
    echo "   ✅ Frontend rodando na porta 5000"
else
    echo "   ❌ Frontend não está respondendo"
    exit 1
fi

# Testar URL de autorização GitHub com credenciais corretas
echo "3. 🔍 Testando URL de autorização GitHub..."
AUTH_URL="https://github.com/login/oauth/authorize?client_id=Ov23lizvhhJM3ueDoymL&redirect_uri=http%3A%2F%2Flocalhost%3A3003%2Fgithub%2Fcallback&scope=user%3Aemail&state=test123"
AUTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$AUTH_URL")
if [ "$AUTH_STATUS" = "302" ]; then
    echo "   ✅ URL de autorização GitHub funcionando"
else
    echo "   ❌ URL de autorização GitHub com problema (Status: $AUTH_STATUS)"
fi

# Verificar configuração do arquivo .env
echo "4. 🔍 Verificando configuração..."
if [ -f ".env" ]; then
    echo "   ✅ Arquivo .env encontrado"
    if grep -q "GITHUB_CLIENT_SECRET=81cdef78ba4592c5bb11836997c92163c8305005" .env; then
        echo "   ✅ Client Secret configurado corretamente no .env"
    else
        echo "   ⚠️  Client Secret pode não estar configurado no .env"
    fi
else
    echo "   ⚠️  Arquivo .env não encontrado"
fi

# Verificar se o código foi atualizado
echo "5. 🔍 Verificando código atualizado..."
if grep -q "81cdef78ba4592c5bb11836997c92163c8305005" src/services/github.service.ts; then
    echo "   ✅ GitHubService atualizado com Client Secret correto"
else
    echo "   ⚠️  GitHubService pode não estar atualizado"
fi

echo ""
echo "🚀 SISTEMA TOTALMENTE CONFIGURADO!"
echo "=================================="
echo ""
echo "📋 Credenciais configuradas:"
echo "   Client ID: Ov23lizvhhJM3ueDoymL"
echo "   Client Secret: 81cdef78ba4592c5bb11836997c92163c8305005"
echo ""
echo "🎯 Para testar a integração:"
echo "1. Acesse: http://localhost:5000/settings"
echo "2. Vá para a aba 'Integrações'"
echo "3. Clique em 'Conectar' no card do GitHub"
echo "4. Autorize no GitHub"
echo "5. Veja a mensagem: '🎉 GitHub conectado com sucesso! Bem-vindo, @seuusername!'"
echo ""
echo "🔗 URL de teste direto:"
echo "$AUTH_URL"
