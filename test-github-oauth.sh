#!/bin/bash

echo "🔍 Testando URL de autorização GitHub..."

# Testar se a URL está acessível
URL="https://github.com/login/oauth/authorize?client_id=Ov23lizvhhJM3ueDoymL&redirect_uri=http%3A%2F%2Flocalhost%3A3003%2Fgithub%2Fcallback&scope=user%3Aemail&state=test123"

echo "📋 URL sendo testada:"
echo "$URL"
echo ""

# Testar com curl
echo "🧪 Testando com curl..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$URL")
echo "HTTP Status Code: $HTTP_CODE"

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ URL está acessível (200 OK)"
elif [ "$HTTP_CODE" = "404" ]; then
    echo "❌ URL retorna 404 - Client ID pode estar incorreto"
elif [ "$HTTP_CODE" = "302" ]; then
    echo "🔄 URL redireciona (302) - Normal para OAuth"
else
    echo "⚠️  Status inesperado: $HTTP_CODE"
fi

echo ""
echo "🔗 Teste manual:"
echo "Abra esta URL no navegador:"
echo "$URL"