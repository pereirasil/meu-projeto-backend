#!/bin/bash

echo "🚀 CONFIGURAÇÃO COMPLETA DO SERVIDOR DE PRODUÇÃO"
echo "==============================================="

echo ""
echo "📋 Após conectar ao servidor via SSH, execute estes comandos:"
echo ""

echo "# 1. Ir para o diretório do projeto"
echo "cd /var/www/timeboard/votacao-backend"
echo ""

echo "# 2. Verificar se o deploy foi aplicado"
echo "git log --oneline -1"
echo "ls -la dist/"
echo ""

echo "# 3. Verificar status do PM2"
echo "pm2 status"
echo "pm2 logs votacao-backend --lines 10"
echo ""

echo "# 4. Se a aplicação não estiver rodando, iniciar"
echo "pm2 start dist/main.js --name votacao-backend"
echo ""

echo "# 5. Configurar variáveis GitHub"
echo "pm2 set GITHUB_CLIENT_ID \"Ov23lizvhhJM3ueDoymL\""
echo "pm2 set GITHUB_CLIENT_SECRET \"81cdef78ba4592c5bb11836997c92163c8305005\""
echo ""

echo "# 6. Reiniciar aplicação"
echo "pm2 restart votacao-backend"
echo ""

echo "# 7. Aguardar e testar"
echo "sleep 10"
echo "curl https://api.timeboard.site/github/env-check"
echo ""

echo "💡 COMANDO COMPLETO PARA COPIAR E COLAR NO SERVIDOR:"
echo "===================================================="
echo ""
echo "cd /var/www/timeboard/votacao-backend && git log --oneline -1 && ls -la dist/ && pm2 status && pm2 logs votacao-backend --lines 5 && pm2 set GITHUB_CLIENT_ID \"Ov23lizvhhJM3ueDoymL\" && pm2 set GITHUB_CLIENT_SECRET \"81cdef78ba4592c5bb11836997c92163c8305005\" && pm2 restart votacao-backend && sleep 10 && curl https://api.timeboard.site/github/env-check"
