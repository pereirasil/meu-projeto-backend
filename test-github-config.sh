#!/bin/bash

echo "🔍 TESTE DIRETO - GitHubService Configuration"
echo "============================================="

# Verificar se o backend está rodando
echo "1. Verificando se o backend está rodando..."
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3003)
if [ "$BACKEND_STATUS" = "200" ]; then
    echo "   ✅ Backend rodando"
else
    echo "   ❌ Backend não está respondendo"
    exit 1
fi

echo ""
echo "2. Testando URLs de autorização..."

# URL com O maiúscula (correta)
CORRECT_URL="https://github.com/login/oauth/authorize?client_id=Ov23lizvhhJM3ueDoymL&redirect_uri=http%3A%2F%2Flocalhost%3A3003%2Fgithub%2Fcallback&scope=user%3Aemail&state=test123"
echo "   Testando URL correta (O maiúscula):"
CORRECT_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$CORRECT_URL")
echo "   Status: $CORRECT_STATUS"

# URL com zero (incorreta)
WRONG_URL="https://github.com/login/oauth/authorize?client_id=0v23lizvhhJM3ueDoymL&redirect_uri=http%3A%2F%2Flocalhost%3A3003%2Fgithub%2Fcallback&scope=user%3Aemail&state=test123"
echo "   Testando URL incorreta (zero):"
WRONG_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$WRONG_URL")
echo "   Status: $WRONG_STATUS"

echo ""
echo "3. Verificando configuração do código..."

# Verificar se o código tem a configuração correta
if grep -q "Ov23lizvhhJM3ueDoymL" src/services/github.service.ts; then
    echo "   ✅ GitHubService configurado com Client ID correto (O maiúscula)"
else
    echo "   ❌ GitHubService não tem Client ID correto"
fi

if grep -q "81cdef78ba4592c5bb11836997c92163c8305005" src/services/github.service.ts; then
    echo "   ✅ GitHubService configurado com Client Secret correto"
else
    echo "   ❌ GitHubService não tem Client Secret correto"
fi

echo ""
echo "4. Verificando arquivo .env..."
if [ -f ".env" ]; then
    if grep -q "GITHUB_CLIENT_ID=Ov23lizvhhJM3ueDoymL" .env; then
        echo "   ✅ .env tem Client ID correto"
    else
        echo "   ⚠️  .env pode não ter Client ID correto"
    fi
    
    if grep -q "GITHUB_CLIENT_SECRET=81cdef78ba4592c5bb11836997c92163c8305005" .env; then
        echo "   ✅ .env tem Client Secret correto"
    else
        echo "   ⚠️  .env pode não ter Client Secret correto"
    fi
else
    echo "   ⚠️  Arquivo .env não encontrado"
fi

echo ""
echo "🎯 CONCLUSÃO:"
if [ "$CORRECT_STATUS" = "302" ] && [ "$WRONG_STATUS" = "302" ]; then
    echo "   Ambas as URLs funcionam (GitHub aceita ambos os formatos)"
    echo "   Mas use sempre: Ov23lizvhhJM3ueDoymL (O maiúscula)"
elif [ "$CORRECT_STATUS" = "302" ]; then
    echo "   ✅ Apenas a URL correta funciona"
    echo "   Use: Ov23lizvhhJM3ueDoymL (O maiúscula)"
else
    echo "   ❌ Nenhuma URL está funcionando"
fi

echo ""
echo "🔗 URL CORRETA PARA TESTE:"
echo "$CORRECT_URL"
