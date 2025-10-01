#!/bin/bash

echo "🔍 DIAGNÓSTICO - URL GitHub OAuth"
echo "================================="

# URL incorreta (com zero)
WRONG_URL="https://github.com/login/oauth/authorize?client_id=0v23lizvhhJM3ueDoymL&redirect_uri=http%3A%2F%2Flocalhost%3A3003%2Fgithub%2Fcallback&scope=user%3Aemail&state=user_21_1759341963221"

# URL correta (com O maiúscula)
CORRECT_URL="https://github.com/login/oauth/authorize?client_id=Ov23lizvhhJM3ueDoymL&redirect_uri=http%3A%2F%2Flocalhost%3A3003%2Fgithub%2Fcallback&scope=user%3Aemail&state=user_21_1759341963221"

echo "❌ URL INCORRETA (com zero):"
echo "$WRONG_URL"
echo ""

echo "✅ URL CORRETA (com O maiúscula):"
echo "$CORRECT_URL"
echo ""

echo "🔍 Testando URLs..."
echo ""

echo "1. Testando URL incorreta (deve dar 404):"
WRONG_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$WRONG_URL")
echo "   Status: $WRONG_STATUS"
if [ "$WRONG_STATUS" = "404" ]; then
    echo "   ✅ Confirmado: URL incorreta retorna 404"
else
    echo "   ⚠️  Status inesperado: $WRONG_STATUS"
fi
echo ""

echo "2. Testando URL correta (deve dar 302):"
CORRECT_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$CORRECT_URL")
echo "   Status: $CORRECT_STATUS"
if [ "$CORRECT_STATUS" = "302" ]; then
    echo "   ✅ Confirmado: URL correta funciona!"
else
    echo "   ⚠️  Status inesperado: $CORRECT_STATUS"
fi
echo ""

echo "🎯 SOLUÇÃO:"
echo "Use a URL correta com 'O' maiúscula:"
echo "$CORRECT_URL"
