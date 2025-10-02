const mysql = require('mysql2/promise');

async function createSprintsTable() {
  let connection;
  
  try {
    // Configuração do banco de dados
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3306,
      user: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || 'gogoto38_votacao',
    });

    console.log('Conectado ao banco de dados MySQL');

    // Criar tabela sprints
    const createSprintsTable = `
      CREATE TABLE IF NOT EXISTS \`sprints\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`nome\` varchar(255) NOT NULL,
        \`descricao\` text,
        \`data_inicio\` date NOT NULL,
        \`data_fim\` date NOT NULL,
        \`status\` enum('planejada','ativa','encerrada','cancelada') NOT NULL DEFAULT 'planejada',
        \`board_id\` int NOT NULL,
        \`total_tasks\` int NOT NULL DEFAULT '0',
        \`tasks_concluidas\` int NOT NULL DEFAULT '0',
        \`tasks_em_andamento\` int NOT NULL DEFAULT '0',
        \`tasks_pendentes\` int NOT NULL DEFAULT '0',
        \`progresso\` decimal(5,2) NOT NULL DEFAULT '0.00',
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`FK_sprints_board_id\` (\`board_id\`),
        CONSTRAINT \`FK_sprints_board_id\` FOREIGN KEY (\`board_id\`) REFERENCES \`boards\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
    `;

    await connection.execute(createSprintsTable);
    console.log('✅ Tabela sprints criada com sucesso!');

    // Criar tabela sprint_tasks
    const createSprintTasksTable = `
      CREATE TABLE IF NOT EXISTS \`sprint_tasks\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`sprint_id\` int NOT NULL,
        \`card_id\` int NOT NULL,
        \`status\` enum('pendente','em_andamento','concluida','cancelada') NOT NULL DEFAULT 'pendente',
        \`prioridade\` enum('baixa','media','alta','urgente') NOT NULL DEFAULT 'media',
        \`assignee_id\` int DEFAULT NULL,
        \`observacoes\` text,
        \`data_limite\` date DEFAULT NULL,
        \`estimativa_horas\` int NOT NULL DEFAULT '0',
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`FK_sprint_tasks_sprint_id\` (\`sprint_id\`),
        KEY \`FK_sprint_tasks_card_id\` (\`card_id\`),
        CONSTRAINT \`FK_sprint_tasks_sprint_id\` FOREIGN KEY (\`sprint_id\`) REFERENCES \`sprints\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_sprint_tasks_card_id\` FOREIGN KEY (\`card_id\`) REFERENCES \`cards\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
    `;

    await connection.execute(createSprintTasksTable);
    console.log('✅ Tabela sprint_tasks criada com sucesso!');

    // Verificar se as tabelas foram criadas
    const [tables] = await connection.execute("SHOW TABLES LIKE 'sprints'");
    console.log('📋 Tabelas encontradas:', tables);

    const [sprintTasks] = await connection.execute("SHOW TABLES LIKE 'sprint_tasks'");
    console.log('📋 Tabelas de tasks encontradas:', sprintTasks);

  } catch (error) {
    console.error('❌ Erro ao criar tabelas:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexão com banco de dados encerrada');
    }
  }
}

// Executar o script
createSprintsTable();
