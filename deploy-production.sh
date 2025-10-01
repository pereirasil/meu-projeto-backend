#!/bin/bash

echo "🚀 SCRIPT DE DEPLOY PARA PRODUÇÃO"
echo "=================================="

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Execute este script no diretório raiz do projeto"
    exit 1
fi

echo ""
echo "📋 VERIFICAÇÕES PRÉ-DEPLOY:"
echo ""

# 1. Verificar se as variáveis de ambiente estão configuradas
echo "1. 🔍 Verificando variáveis de ambiente..."
if [ ! -f ".env.production" ]; then
    echo "   ⚠️  Arquivo .env.production não encontrado"
    echo "   📝 Crie o arquivo baseado em env-production-example.txt"
    echo "   💡 Comando: cp env-production-example.txt .env.production"
    exit 1
else
    echo "   ✅ Arquivo .env.production encontrado"
fi

# 2. Verificar se o GitHub OAuth está configurado
echo ""
echo "2. 🔍 Verificando configuração GitHub OAuth..."
if grep -q "seu_client_id_de_producao" .env.production; then
    echo "   ❌ GitHub Client ID não configurado"
    echo "   📝 Configure GITHUB_CLIENT_ID e GITHUB_CLIENT_SECRET no .env.production"
    exit 1
else
    echo "   ✅ GitHub OAuth configurado"
fi

# 3. Verificar se o JWT Secret está configurado
echo ""
echo "3. 🔍 Verificando JWT Secret..."
if grep -q "sua_chave_jwt_secreta_forte_de_producao" .env.production; then
    echo "   ❌ JWT Secret não configurado"
    echo "   📝 Configure JWT_SECRET no .env.production"
    exit 1
else
    echo "   ✅ JWT Secret configurado"
fi

# 4. Verificar se o banco de dados está configurado
echo ""
echo "4. 🔍 Verificando configuração do banco..."
if grep -q "postgresql://usuario:senha@host:porta/database" .env.production; then
    echo "   ❌ Database URL não configurado"
    echo "   📝 Configure DATABASE_URL no .env.production"
    exit 1
else
    echo "   ✅ Database URL configurado"
fi

echo ""
echo "🔨 INICIANDO BUILD DE PRODUÇÃO:"
echo ""

# 5. Instalar dependências
echo "5. 📦 Instalando dependências..."
npm ci --production=false
if [ $? -ne 0 ]; then
    echo "   ❌ Erro ao instalar dependências"
    exit 1
fi
echo "   ✅ Dependências instaladas"

# 6. Executar testes (se existirem)
echo ""
echo "6. 🧪 Executando testes..."
if [ -f "test" ] || [ -d "test" ]; then
    npm test -- --passWithNoTests
    if [ $? -ne 0 ]; then
        echo "   ⚠️  Testes falharam, mas continuando..."
    else
        echo "   ✅ Testes passaram"
    fi
else
    echo "   ℹ️  Nenhum teste encontrado"
fi

# 7. Build do projeto
echo ""
echo "7. 🔨 Fazendo build do projeto..."
npm run build
if [ $? -ne 0 ]; then
    echo "   ❌ Erro no build"
    exit 1
fi
echo "   ✅ Build concluído"

# 8. Verificar se o build foi criado
echo ""
echo "8. 🔍 Verificando arquivos de build..."
if [ -d "dist" ]; then
    echo "   ✅ Diretório dist criado"
    echo "   📁 Arquivos gerados:"
    ls -la dist/ | head -10
else
    echo "   ❌ Diretório dist não encontrado"
    exit 1
fi

echo ""
echo "🎉 BUILD DE PRODUÇÃO CONCLUÍDO!"
echo "================================"
echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo "1. 📤 Faça upload dos arquivos para o servidor"
echo "2. 🔧 Configure o servidor web (Nginx/Apache)"
echo "3. 🔐 Configure SSL/TLS"
echo "4. 🗄️ Configure o banco de dados PostgreSQL"
echo "5. 🚀 Inicie o serviço com PM2"
echo ""
echo "💡 Comandos úteis:"
echo "   pm2 start dist/main.js --name 'meu-projeto-backend'"
echo "   pm2 save"
echo "   pm2 startup"
