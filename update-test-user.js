const mysql = require('mysql2/promise');

async function createUserWithKnownPassword() {
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

    console.log('🔍 Verificando usuário de teste...');

    // Verificar se usuário de teste existe
    const [existingUser] = await connection.execute(
      'SELECT id, name, email, password_hash FROM users WHERE email = ?',
      ['test@example.com']
    );

    if (existingUser.length > 0) {
      console.log('✅ Usuário de teste existe:', existingUser[0]);
      
      // Atualizar a senha para uma conhecida (hash de 'password123')
      const knownPasswordHash = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'; // hash de 'password123'
      
      await connection.execute(
        'UPDATE users SET password_hash = ? WHERE email = ?',
        [knownPasswordHash, 'test@example.com']
      );
      
      console.log('✅ Senha atualizada para "password123"');
      
      return existingUser[0];
    } else {
      console.log('❌ Usuário de teste não encontrado');
    }

  } catch (error) {
    console.error('❌ Erro ao atualizar usuário:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createUserWithKnownPassword();

