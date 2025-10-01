#!/bin/bash

echo "🚀 CONFIGURAÇÃO GITHUB OAUTH EM PRODUÇÃO"
echo "========================================"

echo ""
echo "📋 Passo a passo para configurar:"
echo ""

echo "1. 🔐 Conectar ao servidor de produção:"
echo "   ssh root@191.252.177.174"
echo ""

echo "2. 📁 Ir para o diretório do projeto:"
echo "   cd /var/www/timeboard/votacao-backend"
echo ""

echo "3. 🔍 Verificar se o deploy já foi aplicado:"
echo "   git log --oneline -1"
echo "   ls -la dist/"
echo ""

echo "4. 🔧 Configurar variáveis GitHub (escolha uma opção):"
echo ""
echo "   OPÇÃO A - Via PM2 (Recomendado):"
echo "   pm2 set GITHUB_CLIENT_ID \"Ov23lizvhhJM3ueDoymL\""
echo "   pm2 set GITHUB_CLIENT_SECRET \"81cdef78ba4592c5bb11836997c92163c8305005\""
echo ""
echo "   OPÇÃO B - Via arquivo .env:"
echo "   echo 'GITHUB_CLIENT_ID=Ov23lizvhhJM3ueDoymL' >> .env"
echo "   echo 'GITHUB_CLIENT_SECRET=81cdef78ba4592c5bb11836997c92163c8305005' >> .env"
echo ""

echo "5. 🔄 Reiniciar a aplicação:"
echo "   pm2 restart votacao-backend"
echo ""

echo "6. ✅ Verificar se está funcionando:"
echo "   curl https://api.timeboard.site/github/env-check"
echo ""

echo "💡 COMANDO COMPLETO PARA COPIAR E COLAR:"
echo "=========================================="
echo ""
echo "cd /var/www/timeboard/votacao-backend && pm2 set GITHUB_CLIENT_ID \"Ov23lizvhhJM3ueDoymL\" && pm2 set GITHUB_CLIENT_SECRET \"81cdef78ba4592c5bb11836997c92163c8305005\" && pm2 restart votacao-backend && echo 'Aguardando 10 segundos...' && sleep 10 && curl https://api.timeboard.site/github/env-check"
