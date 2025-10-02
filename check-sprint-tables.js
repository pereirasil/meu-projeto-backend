const mysql = require('mysql2/promise');

async function checkSprintTables() {
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

    console.log('🔍 Verificando tabelas de sprint...');

    // Verificar se a tabela sprints existe
    const [sprintsCheck] = await connection.execute(`
      SELECT COUNT(*) as count FROM information_schema.tables 
      WHERE table_schema = 'gogoto38_votacao' AND table_name = 'sprints'
    `);
    
    console.log('📊 Tabela sprints existe:', sprintsCheck[0].count > 0);

    // Verificar se a tabela sprint_tasks existe
    const [tasksCheck] = await connection.execute(`
      SELECT COUNT(*) as count FROM information_schema.tables 
      WHERE table_schema = 'gogoto38_votacao' AND table_name = 'sprint_tasks'
    `);
    
    console.log('📊 Tabela sprint_tasks existe:', tasksCheck[0].count > 0);

    // Se as tabelas existirem, mostrar a estrutura
    if (sprintsCheck[0].count > 0) {
      console.log('\n📋 Estrutura da tabela sprints:');
      const [sprintsStructure] = await connection.execute('DESCRIBE sprints');
      console.table(sprintsStructure);
    }

    if (tasksCheck[0].count > 0) {
      console.log('\n📋 Estrutura da tabela sprint_tasks:');
      const [tasksStructure] = await connection.execute('DESCRIBE sprint_tasks');
      console.table(tasksStructure);
    }

    // Se as tabelas não existirem, criar elas
    if (sprintsCheck[0].count === 0 || tasksCheck[0].count === 0) {
      console.log('\n🔧 Criando tabelas de sprint...');
      
      if (sprintsCheck[0].count === 0) {
        await connection.execute(`
          CREATE TABLE IF NOT EXISTS sprints (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nome VARCHAR(255) NOT NULL,
            descricao TEXT,
            data_inicio DATE NOT NULL,
            data_fim DATE NOT NULL,
            status ENUM('planejada', 'ativa', 'encerrada', 'cancelada') DEFAULT 'planejada',
            board_id INT NOT NULL,
            total_tasks INT DEFAULT 0,
            tasks_concluidas INT DEFAULT 0,
            tasks_em_andamento INT DEFAULT 0,
            tasks_pendentes INT DEFAULT 0,
            progresso DECIMAL(5,2) DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE
          )
        `);
        console.log('✅ Tabela sprints criada');
      }

      if (tasksCheck[0].count === 0) {
        await connection.execute(`
          CREATE TABLE IF NOT EXISTS sprint_tasks (
            id INT AUTO_INCREMENT PRIMARY KEY,
            sprint_id INT NOT NULL,
            card_id INT NOT NULL,
            status ENUM('pendente', 'em_andamento', 'concluida', 'cancelada') DEFAULT 'pendente',
            prioridade ENUM('baixa', 'media', 'alta', 'urgente') DEFAULT 'media',
            assignee_id INT,
            observacoes TEXT,
            data_limite DATE,
            estimativa_horas INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (sprint_id) REFERENCES sprints(id) ON DELETE CASCADE,
            FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE
          )
        `);
        console.log('✅ Tabela sprint_tasks criada');
      }
    }

  } catch (error) {
    console.error('❌ Erro ao verificar/criar tabelas:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkSprintTables();

