const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function createTestUser() {
  let connection;
  
  try {
    // Configuração do banco de dados
    connection = await mysql.createConnection({
      host: '192.185.212.7',
      port: 3306,
      user: 'gogoto38_votacao',
      password: 'MZE36vkT',
      database: 'gogoto38_votacao'
    });

    console.log('🔍 Verificando usuários existentes...');

    // Verificar se já existe um usuário de teste
    const [existingUsers] = await connection.execute(
      'SELECT id, name, email FROM users WHERE email = ?',
      ['test@example.com']
    );

    if (existingUsers.length > 0) {
      console.log('✅ Usuário de teste já existe:', existingUsers[0]);
      return existingUsers[0];
    }

    console.log('👤 Criando usuário de teste...');

    // Criar hash da senha
    const passwordHash = await bcrypt.hash('password', 10);

    // Inserir usuário de teste
    const [result] = await connection.execute(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      ['Usuário Teste', 'test@example.com', passwordHash]
    );

    console.log('✅ Usuário de teste criado com ID:', result.insertId);

    return {
      id: result.insertId,
      name: 'Usuário Teste',
      email: 'test@example.com'
    };

  } catch (error) {
    console.error('❌ Erro ao criar usuário de teste:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createTestUser();

