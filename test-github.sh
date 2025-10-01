#!/bin/bash

echo "🧪 Teste da Integração GitHub"
echo "=============================="
echo ""

# Verificar se o backend está rodando
if curl -s http://localhost:3003/ > /dev/null; then
    echo "✅ Backend rodando em http://localhost:3003"
else
    echo "❌ Backend não está rodando"
    echo "   Execute: cd /Users/andersonpereira/apps/meu-projeto-backend && npm run start:dev"
    exit 1
fi

# Verificar se o frontend está rodando
if curl -s http://localhost:5000/ > /dev/null; then
    echo "✅ Frontend rodando em http://localhost:5000"
else
    echo "❌ Frontend não está rodando"
    echo "   Execute: cd /Users/andersonpereira/apps/votacao && npm start"
    exit 1
fi

echo ""
echo "🔗 URLs para testar:"
echo "   Frontend: http://localhost:5000"
echo "   Backend: http://localhost:3003"
echo "   Swagger: http://localhost:3003/docs"
echo ""
echo "📋 Próximos passos:"
echo "   1. Configure as credenciais do GitHub (veja INSTRUCOES_GITHUB.md)"
echo "   2. Acesse http://localhost:5000"
echo "   3. Faça login"
echo "   4. Vá em Configurações > Integrações"
echo "   5. Clique em 'Conectar GitHub'"
echo ""

