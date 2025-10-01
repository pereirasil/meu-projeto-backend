#!/bin/bash

# Script de Migração para Sistema Unificado
# Este script ajuda na transição do Express.js para NestJS

echo "🚀 Iniciando migração para sistema unificado..."

# 1. Verificar se o PostgreSQL está rodando
echo "📊 Verificando conexão com PostgreSQL..."
if ! pg_isready -h localhost -p 5432 -U postgres; then
    echo "❌ PostgreSQL não está rodando. Inicie o serviço primeiro."
    exit 1
fi

# 2. Executar script de setup do banco
echo "🗄️ Configurando banco de dados..."
psql -U postgres -d trello_db -f database-setup.sql

if [ $? -eq 0 ]; then
    echo "✅ Banco de dados configurado com sucesso!"
else
    echo "❌ Erro ao configurar banco de dados."
    exit 1
fi

# 3. Instalar dependências
echo "📦 Instalando dependências..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependências instaladas com sucesso!"
else
    echo "❌ Erro ao instalar dependências."
    exit 1
fi

# 4. Compilar projeto
echo "🔨 Compilando projeto..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Projeto compilado com sucesso!"
else
    echo "❌ Erro na compilação."
    exit 1
fi

# 5. Verificar se o arquivo .env existe
if [ ! -f .env ]; then
    echo "⚠️ Arquivo .env não encontrado. Criando template..."
    cat > .env << EOF
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=trello_db

# JWT Configuration
JWT_SECRET=your_jwt_secret_here_change_this_in_production

# Application Configuration
NODE_ENV=development
PORT=3003
HOST=0.0.0.0

# CORS Configuration
CORS_ORIGINS=["http://localhost:3000","http://localhost:5000","http://localhost:5001","http://192.168.0.127:5000","https://timeboard.site","https://app.timeboard.site"]
EOF
    echo "📝 Arquivo .env criado. Configure as variáveis conforme necessário."
fi

echo ""
echo "🎉 Migração concluída com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo "1. Configure as variáveis no arquivo .env"
echo "2. Execute: npm run start:dev"
echo "3. Teste a API em: http://localhost:3003"
echo "4. Documentação Swagger: http://localhost:3003/docs"
echo ""
echo "🔄 Para parar o servidor Express.js antigo:"
echo "   - Pare o processo na porta 3003 (se estiver rodando)"
echo "   - O NestJS agora gerencia tudo"
echo ""
echo "✅ Sistema unificado pronto para uso!"
