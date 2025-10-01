#!/bin/bash

echo "🔍 VERIFICANDO VARIÁVEIS DE AMBIENTE EM PRODUÇÃO"
echo "==============================================="

echo ""
echo "📋 Execute estes comandos no servidor de produção:"
echo ""

echo "1. 🔐 Conectar ao servidor:"
echo "   ssh root@191.252.177.174"
echo ""

echo "2. 📁 Ir para o diretório do projeto:"
echo "   cd /var/www/timeboard/votacao-backend"
echo ""

echo "3. 🔍 Verificar TODAS as variáveis de ambiente atuais:"
echo "   echo '=== VARIÁVEIS DE AMBIENTE ATUAIS ==='"
echo "   env | grep -E '(GITHUB|JWT|DATABASE|NODE)' | sort"
echo ""

echo "4. 📄 Verificar arquivos de configuração existentes:"
echo "   echo '=== ARQUIVOS DE CONFIGURAÇÃO ==='"
echo "   ls -la .env*"
echo "   echo '--- Conteúdo do .env (se existir) ---'"
echo "   cat .env 2>/dev/null || echo 'Arquivo .env não encontrado'"
echo ""

echo "5. 🔧 Verificar configuração do PM2:"
echo "   echo '=== CONFIGURAÇÃO PM2 ==='"
echo "   pm2 env"
echo "   pm2 show votacao-backend"
echo ""

echo "6. 📊 Verificar logs recentes:"
echo "   echo '=== LOGS RECENTES ==='"
echo "   pm2 logs votacao-backend --lines 10"
echo ""

echo "7. 🌐 Testar se o servidor está respondendo:"
echo "   curl -s https://api.timeboard.site/ || echo 'Servidor não está respondendo'"
echo ""

echo "💡 COMANDO COMPLETO PARA COPIAR E COLAR:"
echo "=========================================="
echo ""
echo "cd /var/www/timeboard/votacao-backend && echo '=== VARIÁVEIS DE AMBIENTE ATUAIS ===' && env | grep -E '(GITHUB|JWT|DATABASE|NODE)' | sort && echo '' && echo '=== ARQUIVOS DE CONFIGURAÇÃO ===' && ls -la .env* && echo '--- Conteúdo do .env (se existir) ---' && cat .env 2>/dev/null || echo 'Arquivo .env não encontrado' && echo '' && echo '=== CONFIGURAÇÃO PM2 ===' && pm2 env && pm2 show votacao-backend"