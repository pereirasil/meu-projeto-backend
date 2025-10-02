const mysql = require('mysql2/promise');

async function createTestCard() {
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

    console.log('🔍 Verificando listas...');

    // Verificar listas
    const [lists] = await connection.execute(
      'SELECT id, title, board_id FROM lists LIMIT 3'
    );
    console.log('📝 Listas encontradas:', lists);

    if (lists.length === 0) {
      console.log('❌ Nenhuma lista encontrada. Criando lista de teste...');
      
      // Criar uma lista de teste
      const [listResult] = await connection.execute(
        'INSERT INTO lists (title, board_id, position) VALUES (?, ?, ?)',
        ['Lista de Teste', 3, 1]
      );
      
      console.log('✅ Lista criada com ID:', listResult.insertId);
      
      // Criar um card de teste
      const [cardResult] = await connection.execute(
        'INSERT INTO cards (title, description, list_id, position) VALUES (?, ?, ?, ?)',
        ['Card de Teste', 'Descrição do card de teste', listResult.insertId, 1]
      );
      
      console.log('✅ Card criado com ID:', cardResult.insertId);
      
      return {
        listId: listResult.insertId,
        cardId: cardResult.insertId
      };
    } else {
      console.log('✅ Usando primeira lista:', lists[0]);
      
      // Criar um card de teste na primeira lista
      const [cardResult] = await connection.execute(
        'INSERT INTO cards (title, description, list_id, position) VALUES (?, ?, ?, ?)',
        ['Card de Teste', 'Descrição do card de teste', lists[0].id, 1]
      );
      
      console.log('✅ Card criado com ID:', cardResult.insertId);
      
      return {
        listId: lists[0].id,
        cardId: cardResult.insertId
      };
    }

  } catch (error) {
    console.error('❌ Erro ao criar card de teste:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createTestCard();

