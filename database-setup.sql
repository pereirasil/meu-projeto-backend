-- Script de configuração do banco de dados para o sistema Trello
-- Execute este script no PostgreSQL para criar todas as tabelas necessárias

-- Criar banco de dados (execute separadamente se necessário)
-- CREATE DATABASE trello_db;

-- Conectar ao banco trello_db antes de executar os comandos abaixo

-- 1. Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabela de quadros
CREATE TABLE IF NOT EXISTS boards (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_public BOOLEAN DEFAULT false,
    color VARCHAR(50) DEFAULT '#0079bf',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabela de listas
CREATE TABLE IF NOT EXISTS lists (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    board_id INTEGER NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabela de cartões
CREATE TABLE IF NOT EXISTS cards (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    list_id INTEGER NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
    position INTEGER NOT NULL DEFAULT 0,
    due_date TIMESTAMP,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    assigned_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabela de etiquetas
CREATE TABLE IF NOT EXISTS labels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(50) NOT NULL,
    board_id INTEGER NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tabela de relacionamento card-etiqueta
CREATE TABLE IF NOT EXISTS card_labels (
    card_id INTEGER NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    label_id INTEGER NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
    PRIMARY KEY (card_id, label_id)
);

-- 7. Tabela de checklists
CREATE TABLE IF NOT EXISTS checklists (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    card_id INTEGER NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Tabela de itens da checklist
CREATE TABLE IF NOT EXISTS checklist_items (
    id SERIAL PRIMARY KEY,
    text VARCHAR(500) NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    checklist_id INTEGER NOT NULL REFERENCES checklists(id) ON DELETE CASCADE,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Tabela de comentários
CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    card_id INTEGER NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Tabela de membros do quadro
CREATE TABLE IF NOT EXISTS board_members (
    board_id INTEGER NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (board_id, user_id)
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_boards_user_id ON boards(user_id);
CREATE INDEX IF NOT EXISTS idx_lists_board_id ON lists(board_id);
CREATE INDEX IF NOT EXISTS idx_cards_list_id ON cards(list_id);
CREATE INDEX IF NOT EXISTS idx_cards_due_date ON cards(due_date);
CREATE INDEX IF NOT EXISTS idx_cards_assigned_user_id ON cards(assigned_user_id);
CREATE INDEX IF NOT EXISTS idx_labels_board_id ON labels(board_id);
CREATE INDEX IF NOT EXISTS idx_checklists_card_id ON checklists(card_id);
CREATE INDEX IF NOT EXISTS idx_comments_card_id ON comments(card_id);
CREATE INDEX IF NOT EXISTS idx_board_members_board_id ON board_members(board_id);
CREATE INDEX IF NOT EXISTS idx_board_members_user_id ON board_members(user_id);

-- Inserir dados de exemplo (opcional)
-- Usuário de exemplo
INSERT INTO users (name, email, password_hash) VALUES 
('Usuário Exemplo', 'exemplo@email.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/vHhHhHh');

-- Quadro de exemplo
INSERT INTO boards (title, description, user_id, is_public, color) VALUES 
('Meu Primeiro Quadro', 'Um quadro para organizar minhas tarefas', 1, true, '#0079bf');

-- Lista de exemplo
INSERT INTO lists (title, board_id, position) VALUES 
('A Fazer', 1, 0),
('Fazendo', 1, 1),
('Concluído', 1, 2);

-- Etiquetas de exemplo
INSERT INTO labels (name, color, board_id) VALUES 
('Urgente', '#ff0000', 1),
('Importante', '#ffa500', 1),
('Baixa Prioridade', '#00ff00', 1);

-- Comentário de exemplo
INSERT INTO comments (content, card_id, user_id) VALUES 
('Bem-vindo ao seu primeiro quadro!', 1, 1);

-- 11. Tabela de salas de votação
CREATE TABLE IF NOT EXISTS voting_rooms (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. Tabela de participantes da votação
CREATE TABLE IF NOT EXISTS voting_participants (
    id SERIAL PRIMARY KEY,
    room_id VARCHAR(36) NOT NULL REFERENCES voting_rooms(id) ON DELETE CASCADE,
    user_name VARCHAR(255) NOT NULL,
    user_role VARCHAR(50) DEFAULT 'participant',
    avatar_url VARCHAR(500),
    socket_id VARCHAR(100),
    is_connected BOOLEAN DEFAULT true,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13. Tabela de votos
CREATE TABLE IF NOT EXISTS voting_votes (
    id SERIAL PRIMARY KEY,
    room_id VARCHAR(36) NOT NULL REFERENCES voting_rooms(id) ON DELETE CASCADE,
    user_name VARCHAR(255) NOT NULL,
    socket_id VARCHAR(100),
    vote_value INTEGER NOT NULL,
    is_revealed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 14. Tabela de mensagens do chat
CREATE TABLE IF NOT EXISTS voting_messages (
    id SERIAL PRIMARY KEY,
    room_id VARCHAR(36) NOT NULL REFERENCES voting_rooms(id) ON DELETE CASCADE,
    user_name VARCHAR(255) NOT NULL,
    socket_id VARCHAR(100),
    avatar_url VARCHAR(500),
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar índices adicionais para o sistema de votação
CREATE INDEX IF NOT EXISTS idx_voting_rooms_created_by ON voting_rooms(created_by);
CREATE INDEX IF NOT EXISTS idx_voting_rooms_is_active ON voting_rooms(is_active);
CREATE INDEX IF NOT EXISTS idx_voting_participants_room_id ON voting_participants(room_id);
CREATE INDEX IF NOT EXISTS idx_voting_participants_user_name ON voting_participants(user_name);
CREATE INDEX IF NOT EXISTS idx_voting_votes_room_id ON voting_votes(room_id);
CREATE INDEX IF NOT EXISTS idx_voting_votes_user_name ON voting_votes(user_name);
CREATE INDEX IF NOT EXISTS idx_voting_messages_room_id ON voting_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_voting_messages_created_at ON voting_messages(created_at);

-- Verificar se as tabelas foram criadas
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
