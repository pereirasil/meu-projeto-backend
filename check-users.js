const mysql = require('mysql2/promise');

async function checkUsers() {
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

    // Verificar usuários existentes
    const [users] = await connection.execute(
      'SELECT id, name, email FROM users LIMIT 5'
    );

    console.log('👥 Usuários encontrados:', users);

    if (users.length > 0) {
      console.log('✅ Usando primeiro usuário para teste:', users[0]);
      return users[0];
    } else {
      console.log('❌ Nenhum usuário encontrado');
    }

  } catch (error) {
    console.error('❌ Erro ao verificar usuários:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkUsers();

