const mysql = require('mysql2/promise');

async function checkTestData() {
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

    console.log('🔍 Verificando dados de teste...');

    // Verificar boards
    const [boards] = await connection.execute(
      'SELECT id, title, user_id FROM boards LIMIT 3'
    );
    console.log('📋 Boards encontrados:', boards);

    // Verificar cards
    const [cards] = await connection.execute(
      'SELECT id, title, list_id FROM cards LIMIT 3'
    );
    console.log('🎯 Cards encontrados:', cards);

    // Verificar sprints
    const [sprints] = await connection.execute(
      'SELECT id, nome, board_id FROM sprints LIMIT 3'
    );
    console.log('🏃 Sprints encontradas:', sprints);

    return {
      boards: boards.length > 0 ? boards[0] : null,
      cards: cards.length > 0 ? cards[0] : null,
      sprints: sprints.length > 0 ? sprints[0] : null
    };

  } catch (error) {
    console.error('❌ Erro ao verificar dados:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkTestData();

