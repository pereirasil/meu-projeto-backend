#!/bin/bash

# Script para testar a geração da URL de autorização GitHub
echo "🔍 Testando geração da URL de autorização GitHub..."

# Client ID correto (com O maiúsculo, não zero)
CLIENT_ID="Ov23lizvhhJM3ueDoymL"
REDIRECT_URI="http://localhost:3003/github/callback"
SCOPE="user:email"
STATE="user_21_$(date +%s)"

# Gerar URL de autorização
AUTH_URL="https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${SCOPE}&state=${STATE}"

echo "📋 Parâmetros:"
echo "  Client ID: ${CLIENT_ID}"
echo "  Redirect URI: ${REDIRECT_URI}"
echo "  Scope: ${SCOPE}"
echo "  State: ${STATE}"
echo ""
echo "🔗 URL de Autorização:"
echo "${AUTH_URL}"
echo ""
echo "✅ Teste a URL acima no navegador"
echo "⚠️  Certifique-se de que o Client ID está correto no GitHub OAuth App"
