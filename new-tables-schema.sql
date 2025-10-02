-- Script para criar as novas tabelas do sistema de sprints, membros e notificações

-- Tabela de Sprints
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
    FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE,
    INDEX idx_sprints_board_id (board_id),
    INDEX idx_sprints_status (status),
    INDEX idx_sprints_dates (data_inicio, data_fim)
);

-- Tabela de Tarefas de Sprint
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
    FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
    FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_sprint_tasks_sprint_id (sprint_id),
    INDEX idx_sprint_tasks_card_id (card_id),
    INDEX idx_sprint_tasks_assignee_id (assignee_id),
    INDEX idx_sprint_tasks_status (status),
    UNIQUE KEY unique_sprint_card (sprint_id, card_id)
);

-- Tabela de Membros da Equipe
CREATE TABLE IF NOT EXISTS team_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    board_id INT NOT NULL,
    role ENUM('owner', 'admin', 'member', 'viewer') DEFAULT 'member',
    permissions JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE,
    INDEX idx_team_members_user_id (user_id),
    INDEX idx_team_members_board_id (board_id),
    INDEX idx_team_members_role (role),
    INDEX idx_team_members_active (is_active),
    UNIQUE KEY unique_user_board (user_id, board_id)
);

-- Tabela de Convites da Equipe
CREATE TABLE IF NOT EXISTS team_invites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    board_id INT NOT NULL,
    role ENUM('owner', 'admin', 'member', 'viewer') DEFAULT 'member',
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    status ENUM('pending', 'accepted', 'declined', 'expired') DEFAULT 'pending',
    invited_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE,
    FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_team_invites_email (email),
    INDEX idx_team_invites_board_id (board_id),
    INDEX idx_team_invites_token (token),
    INDEX idx_team_invites_status (status),
    INDEX idx_team_invites_expires_at (expires_at)
);

-- Tabela de Notificações
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type ENUM('task_assigned', 'task_completed', 'sprint_started', 'sprint_completed', 'board_invite', 'comment_added', 'deadline_reminder', 'system_update') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSON,
    status ENUM('unread', 'read', 'archived') DEFAULT 'unread',
    is_important BOOLEAN DEFAULT FALSE,
    read_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notifications_user_id (user_id),
    INDEX idx_notifications_type (type),
    INDEX idx_notifications_status (status),
    INDEX idx_notifications_important (is_important),
    INDEX idx_notifications_created_at (created_at)
);

-- Inserir dados de exemplo para sprints
INSERT INTO sprints (nome, descricao, data_inicio, data_fim, status, board_id) VALUES
('Sprint 1 - Planejamento', 'Primeira sprint focada no planejamento do projeto', '2024-01-15', '2024-01-29', 'ativa', 1),
('Sprint 2 - Desenvolvimento', 'Segunda sprint focada no desenvolvimento das funcionalidades principais', '2024-01-30', '2024-02-13', 'planejada', 1),
('Sprint 3 - Testes', 'Terceira sprint focada em testes e correções', '2024-02-14', '2024-02-28', 'planejada', 1);

-- Inserir dados de exemplo para membros da equipe
INSERT INTO team_members (user_id, board_id, role) VALUES
(1, 1, 'owner'),
(2, 1, 'admin'),
(3, 1, 'member');

-- Inserir dados de exemplo para notificações
INSERT INTO notifications (user_id, type, title, message, is_important) VALUES
(1, 'sprint_started', 'Sprint iniciada', 'A sprint "Sprint 1 - Planejamento" foi iniciada no board "Projeto Principal"', FALSE),
(2, 'task_assigned', 'Nova tarefa atribuída', 'Você foi atribuído à tarefa "Configurar banco de dados" no board "Projeto Principal"', FALSE),
(3, 'board_invite', 'Convite para board', 'Anderson convidou você para participar do board "Projeto Principal"', TRUE);

-- Atualizar estatísticas das sprints
UPDATE sprints SET 
    total_tasks = (SELECT COUNT(*) FROM sprint_tasks WHERE sprint_id = sprints.id),
    tasks_concluidas = (SELECT COUNT(*) FROM sprint_tasks WHERE sprint_id = sprints.id AND status = 'concluida'),
    tasks_em_andamento = (SELECT COUNT(*) FROM sprint_tasks WHERE sprint_id = sprints.id AND status = 'em_andamento'),
    tasks_pendentes = (SELECT COUNT(*) FROM sprint_tasks WHERE sprint_id = sprints.id AND status = 'pendente'),
    progresso = CASE 
        WHEN (SELECT COUNT(*) FROM sprint_tasks WHERE sprint_id = sprints.id) > 0 
        THEN ROUND((SELECT COUNT(*) FROM sprint_tasks WHERE sprint_id = sprints.id AND status = 'concluida') * 100.0 / (SELECT COUNT(*) FROM sprint_tasks WHERE sprint_id = sprints.id), 2)
        ELSE 0 
    END;
