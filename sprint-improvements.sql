-- Melhorias no sistema de sprints
-- 1. Tarefas da sprint (nova estrutura)
CREATE TABLE sprint_tasks_new (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sprint_id INT NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  prioridade ENUM('baixa', 'media', 'alta', 'urgente') DEFAULT 'media',
  data_limite DATE,
  estimativa_horas INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (sprint_id) REFERENCES sprints(id)
);

-- 2. Colunas do Kanban (dinâmicas)
CREATE TABLE sprint_columns (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sprint_id INT NOT NULL,
  nome VARCHAR(100) NOT NULL,         -- exemplo: "A Fazer", "Em Andamento"
  ordem INT DEFAULT 0,                -- posição da coluna no quadro
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sprint_id) REFERENCES sprints(id)
);

-- 3. Adicionar coluna column_id na nova tabela de tarefas
ALTER TABLE sprint_tasks_new
  ADD COLUMN column_id INT NULL,
  ADD FOREIGN KEY (column_id) REFERENCES sprint_columns(id);

-- 4. Colaboradores (N:N -> uma tarefa pode ter vários usuários)
CREATE TABLE sprint_task_collaborators (
  task_id INT NOT NULL,
  user_id INT NOT NULL,
  PRIMARY KEY (task_id, user_id),
  FOREIGN KEY (task_id) REFERENCES sprint_tasks_new(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. Migrar dados existentes da tabela sprint_tasks para sprint_tasks_new
INSERT INTO sprint_tasks_new (id, sprint_id, titulo, descricao, prioridade, data_limite, estimativa_horas, created_at, updated_at)
SELECT 
  st.id,
  st.sprint_id,
  COALESCE(c.title, 'Tarefa sem título') as titulo,
  COALESCE(c.description, '') as descricao,
  st.prioridade,
  st.data_limite,
  st.estimativa_horas,
  st.created_at,
  st.updated_at
FROM sprint_tasks st
LEFT JOIN cards c ON st.card_id = c.id;

-- 6. Criar colunas padrão para cada sprint existente
INSERT INTO sprint_columns (sprint_id, nome, ordem)
SELECT 
  s.id,
  'A Fazer',
  0
FROM sprints s
WHERE NOT EXISTS (
  SELECT 1 FROM sprint_columns sc WHERE sc.sprint_id = s.id
);

INSERT INTO sprint_columns (sprint_id, nome, ordem)
SELECT 
  s.id,
  'Em Andamento',
  1
FROM sprints s
WHERE NOT EXISTS (
  SELECT 1 FROM sprint_columns sc WHERE sc.sprint_id = s.id AND sc.ordem = 1
);

INSERT INTO sprint_columns (sprint_id, nome, ordem)
SELECT 
  s.id,
  'Concluído',
  2
FROM sprints s
WHERE NOT EXISTS (
  SELECT 1 FROM sprint_columns sc WHERE sc.sprint_id = s.id AND sc.ordem = 2
);

-- 7. Atualizar tarefas para usar a primeira coluna (A Fazer)
UPDATE sprint_tasks_new stn
SET column_id = (
  SELECT sc.id 
  FROM sprint_columns sc 
  WHERE sc.sprint_id = stn.sprint_id 
  AND sc.ordem = 0 
  LIMIT 1
)
WHERE column_id IS NULL;

-- 8. Backup da tabela antiga
RENAME TABLE sprint_tasks TO sprint_tasks_backup;

-- 9. Renomear nova tabela
RENAME TABLE sprint_tasks_new TO sprint_tasks;

-- 10. Adicionar índices para performance
CREATE INDEX idx_sprint_tasks_sprint_id ON sprint_tasks(sprint_id);
CREATE INDEX idx_sprint_tasks_column_id ON sprint_tasks(column_id);
CREATE INDEX idx_sprint_columns_sprint_id ON sprint_columns(sprint_id);
CREATE INDEX idx_sprint_columns_ordem ON sprint_columns(sprint_id, ordem);
CREATE INDEX idx_sprint_task_collaborators_task_id ON sprint_task_collaborators(task_id);
CREATE INDEX idx_sprint_task_collaborators_user_id ON sprint_task_collaborators(user_id);
