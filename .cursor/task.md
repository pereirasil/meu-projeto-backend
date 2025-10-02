# 📊 Análise Completa do Sistema TimeBoard/Votação

## 🗄️ Banco de Dados

### Tabelas Principais
- **users**: Usuários do sistema (id, name, email, password_hash, avatar_url)
- **boards**: Quadros/Kanban boards (id, title, description, user_id, is_public, color)
- **lists**: Listas dentro dos quadros (id, title, board_id, position)
- **cards**: Cartões/Tarefas (id, title, description, list_id, position, due_date, priority, assigned_user_id)
- **labels**: Etiquetas para cartões (id, name, color, board_id)
- **checklists**: Listas de verificação nos cartões (id, title, card_id, position)
- **checklist_items**: Itens das listas de verificação (id, text, is_completed, checklist_id)
- **comments**: Comentários nos cartões (id, content, card_id, user_id)
- **board_members**: Membros dos quadros (board_id, user_id, role)

### Sistema de Votação
- **voting_rooms**: Salas de votação (id, name, is_active, created_by)
- **voting_participants**: Participantes das salas (id, room_id, user_name, user_role, avatar_url, socket_id, is_connected)
- **voting_votes**: Votos dos participantes (id, room_id, user_name, socket_id, vote_value, is_revealed)
- **voting_messages**: Mensagens do chat das salas (id, room_id, user_name, socket_id, avatar_url, message)

### Sistema de Sprints e Equipes
- **sprints**: Sprints do projeto (id, nome, descricao, data_inicio, data_fim, status, board_id, total_tasks, tasks_concluidas, tasks_em_andamento, tasks_pendentes, progresso)
- **sprint_tasks**: Tarefas das sprints (id, sprint_id, card_id, status, prioridade, assignee_id, observacoes, data_limite, estimativa_horas)
- **team_members**: Membros das equipes (id, user_id, board_id, role, permissions, is_active)
- **team_invites**: Convites para equipes (id, email, board_id, role, token, expires_at, status, invited_by)
- **notifications**: Notificações do sistema (id, user_id, type, title, message, data, status, is_important, read_at)

## 🔧 Backend (NestJS)

### Controllers e Endpoints

#### 🔐 Autenticação (`/auth`)
- `POST /auth/register` - Cadastro de usuários
- `POST /auth/login` - Login de usuários
- `GET /auth/profile` - Obter perfil do usuário
- `PUT /auth/profile` - Atualizar perfil do usuário

#### 📋 Quadros (`/boards`)
- `POST /boards` - Criar quadro
- `GET /boards` - Listar quadros do usuário
- `GET /boards/user/:userId` - Quadros de usuário específico
- `GET /boards/:id` - Obter quadro por ID
- `PUT /boards/:id` - Atualizar quadro
- `DELETE /boards/:id` - Deletar quadro
- `POST /boards/:id/members` - Adicionar membro ao quadro
- `PUT /boards/:id/members/:memberId` - Atualizar membro do quadro
- `DELETE /boards/:id/members/:memberId` - Remover membro do quadro

#### 🗳️ Sistema de Votação (`/voting`)
- `POST /voting/rooms` - Criar sala de votação
- `GET /voting/rooms` - Listar salas ativas
- `GET /voting/rooms/:roomId` - Obter sala específica
- `DELETE /voting/rooms/:roomId` - Desativar sala
- `GET /voting/rooms/:roomId/history` - Histórico do chat

#### 🏃‍♂️ Sprints (`/sprints`)
- `POST /sprints` - Criar sprint
- `GET /sprints/board/:boardId` - Sprints de um quadro
- `GET /sprints/:id` - Obter sprint por ID
- `PUT /sprints/:id` - Atualizar sprint
- `DELETE /sprints/:id` - Deletar sprint
- `GET /sprints/:id/tasks` - Tarefas da sprint
- `POST /sprints/tasks` - Adicionar tarefa à sprint
- `PUT /sprints/tasks/:taskId` - Atualizar tarefa da sprint
- `DELETE /sprints/tasks/:taskId` - Remover tarefa da sprint
- `GET /sprints/my/tasks` - Minhas tarefas (com filtros de data)

#### 🐙 Integração GitHub (`/github`)
- `POST /github/auth-url` - Gerar URL de autorização
- `GET /github/callback` - Callback OAuth (GET)
- `POST /github/callback` - Callback OAuth (POST)
- `GET /github/user` - Informações do usuário GitHub
- `GET /github/repositories` - Repositórios do usuário
- `POST /github/webhook` - Criar webhook
- `GET /github/debug` - Debug informações OAuth
- `GET /github/env-check` - Verificar variáveis de ambiente
- `GET /github/status` - Status da conexão GitHub
- `POST /github/validate-token` - Validar token
- `DELETE /github/disconnect` - Desconectar GitHub

#### 📝 Outros Controllers
- **Cards** (`/cards`) - Gerenciamento de cartões/tarefas
- **Lists** (`/lists`) - Gerenciamento de listas
- **Notifications** (`/notifications`) - Sistema de notificações
- **Team Members** (`/team-members`) - Gerenciamento de membros
- **Team** (`/team`) - Operações de equipe

### Entidades Principais
- **User**: Usuários com relacionamentos para boards, cards, comments, voting rooms
- **Board**: Quadros com relacionamentos para lists, labels, members
- **Sprint**: Sprints com relacionamentos para board e tasks
- **VotingRoom**: Salas de votação com participantes, votos e mensagens
- **TeamMember**: Membros de equipe com permissões
- **Notification**: Sistema de notificações com diferentes tipos

## 🎨 Frontend (React)

### Componentes Principais

#### 🏠 Dashboard (`Dashboard.js`)
- **Funcionalidades**:
  - Visualização de quadros em diferentes modos (Kanban, Quadros, Lista)
  - Estatísticas do dashboard com gráficos
  - Filtros por status (público/privado)
  - Busca de quadros
  - Criação de novos quadros
  - Navegação para diferentes seções
  - Controle de tarefas com filtros
  - Modo administrativo para admins

#### 🗳️ Sistema de Votação (`Votacao.js`)
- **Funcionalidades**:
  - Conexão via Socket.IO para tempo real
  - Seleção de cartas de votação (0, 1, 2, 3, 5, 8, 13, ?, ☕)
  - Revelação de votos
  - Reset para nova votação
  - Chat em tempo real
  - Lista de participantes
  - Cálculo de média dos votos

#### 📋 Outros Componentes
- **AdminDashboard**: Dashboard administrativo
- **BoardView**: Visualização de quadro Kanban
- **SprintManagement**: Gerenciamento de sprints
- **MemberManagement**: Gerenciamento de membros
- **MyTasks**: Visualização de tarefas do usuário
- **Settings**: Configurações do usuário
- **ProfileModal**: Modal de perfil
- **LoginPage**: Página de login
- **HomePage**: Página inicial

### Serviços Frontend

#### 🔐 AuthService
- Login/logout de usuários
- Registro de novos usuários
- Gerenciamento de perfil
- Verificação de autenticação
- Armazenamento de tokens

#### 🗳️ VotingService
- Criação de salas de votação
- Listagem de salas ativas
- Obtenção de dados de salas
- Histórico de chat
- Desativação de salas

#### 📋 Outros Serviços
- **BoardService**: Gerenciamento de quadros
- **CardService**: Gerenciamento de cartões
- **SprintService**: Gerenciamento de sprints
- **GitHubService**: Integração com GitHub
- **NotificationService**: Sistema de notificações
- **TeamMemberService**: Gerenciamento de membros

## 🚀 Funcionalidades Principais

### 1. Sistema Kanban Completo
- Criação e gerenciamento de quadros
- Listas e cartões organizáveis
- Etiquetas e checklists
- Comentários e atribuições
- Membros e permissões

### 2. Sistema de Votação em Tempo Real
- Salas de votação com Socket.IO
- Cartas de Planning Poker
- Chat integrado
- Revelação de votos
- Histórico de sessões

### 3. Gerenciamento de Sprints
- Criação e controle de sprints
- Tarefas associadas às sprints
- Métricas de progresso
- Filtros por data e status

### 4. Sistema de Equipes
- Convites por email
- Diferentes níveis de permissão
- Gerenciamento de membros
- Notificações automáticas

### 5. Integração GitHub
- OAuth completo
- Acesso a repositórios
- Criação de webhooks
- Sincronização de dados

### 6. Dashboard Inteligente
- Estatísticas em tempo real
- Gráficos de progresso
- Filtros avançados
- Múltiplos modos de visualização

### 7. Sistema de Notificações
- Diferentes tipos de notificação
- Priorização de mensagens
- Histórico de atividades
- Status de leitura

## 🔧 Tecnologias Utilizadas

### Backend
- **NestJS** - Framework Node.js
- **TypeORM** - ORM para banco de dados
- **MySQL** - Banco de dados principal
- **Socket.IO** - Comunicação em tempo real
- **JWT** - Autenticação
- **Swagger** - Documentação da API

### Frontend
- **React 18** - Framework frontend
- **React Router** - Roteamento
- **Socket.IO Client** - Comunicação em tempo real
- **Axios** - Requisições HTTP
- **Chart.js** - Gráficos e visualizações
- **React Icons** - Ícones

### Infraestrutura
- **Docker** - Containerização
- **GitHub Actions** - CI/CD
- **Vercel** - Deploy frontend
- **MySQL** - Banco de dados em produção

## 📈 Status do Projeto

✅ **Funcionalidades Implementadas**:
- Sistema de autenticação completo
- Gerenciamento de quadros Kanban
- Sistema de votação em tempo real
- Gerenciamento de sprints
- Sistema de equipes e convites
- Integração GitHub OAuth
- Dashboard com estatísticas
- Sistema de notificações
- Interface responsiva

🔄 **Em Desenvolvimento**:
- Melhorias na UX/UI
- Otimizações de performance
- Testes automatizados
- Documentação da API

## 🎯 Próximos Passos Sugeridos

1. **Testes**: Implementar testes unitários e de integração
2. **Performance**: Otimizar consultas do banco de dados
3. **Mobile**: Melhorar experiência mobile
4. **Analytics**: Adicionar métricas de uso
5. **Integrações**: Expandir integrações com outras ferramentas
6. **Segurança**: Implementar auditoria e logs de segurança