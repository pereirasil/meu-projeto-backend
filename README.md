<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# Sistema de Gerenciamento de Tarefas - Trello Clone

Um sistema completo de gerenciamento de tarefas estilo Trello, construído com NestJS, TypeScript e PostgreSQL.

## 🚀 Funcionalidades Principais

### Boards (Quadros)
- ✅ Criar, editar e deletar quadros
- ✅ Configurar visibilidade (público/privado)
- ✅ Personalizar cores e temas
- ✅ Sistema de permissões e membros

### Lists (Listas/Colunas)
- ✅ Criar listas organizacionais
- ✅ Reordenar listas via drag & drop
- ✅ Editar títulos e posições
- ✅ Controle de acesso baseado em permissões

### Cards (Cartões/Tarefas)
- ✅ Criar tarefas com título e descrição
- ✅ Definir prazos de entrega
- ✅ Sistema de prioridades (baixa, média, alta)
- ✅ Atribuir responsáveis
- ✅ Mover cards entre listas
- ✅ Reordenar posições

### Etiquetas e Organização
- ✅ Etiquetas coloridas personalizáveis
- ✅ Categorização de tarefas
- ✅ Filtros por etiquetas

### Checklists
- ✅ Listas de verificação aninhadas
- ✅ Marcar itens como concluídos
- ✅ Reordenar itens

### Comentários e Colaboração
- ✅ Sistema de comentários nos cards
- ✅ Histórico de discussões
- ✅ Identificação de usuários

### Usuários e Permissões
- ✅ Sistema de autenticação JWT
- ✅ Registro e login de usuários
- ✅ Perfis personalizáveis
- ✅ Controle de acesso granular
- ✅ Múltiplos níveis de permissão (owner, admin, member)

### Drag & Drop
- ✅ Arrastar e soltar cards entre listas
- ✅ Reordenar listas nos quadros
- ✅ Reordenar cards dentro das listas
- ✅ Atualizações em tempo real

## 🛠️ Tecnologias Utilizadas

### Backend
- **NestJS** - Framework Node.js para aplicações escaláveis
- **TypeScript** - Linguagem tipada para JavaScript
- **TypeORM** - ORM para banco de dados
- **PostgreSQL** - Banco de dados relacional
- **JWT** - Autenticação stateless
- **Passport** - Estratégias de autenticação
- **bcryptjs** - Hash de senhas seguro
- **Socket.io** - Comunicação em tempo real

### Validação e Segurança
- **class-validator** - Validação de DTOs
- **class-transformer** - Transformação de dados
- **CORS** - Cross-Origin Resource Sharing configurado

## 📁 Estrutura do Projeto

```
src/
├── entities/           # Entidades TypeORM
│   ├── user.entity.ts
│   ├── board.entity.ts
│   ├── list.entity.ts
│   ├── card.entity.ts
│   ├── label.entity.ts
│   ├── checklist.entity.ts
│   ├── checklist-item.entity.ts
│   ├── comment.entity.ts
│   └── board-member.entity.ts
├── dto/               # Data Transfer Objects
│   ├── auth.dto.ts
│   ├── board.dto.ts
│   ├── list.dto.ts
│   └── card.dto.ts
├── services/          # Lógica de negócio
│   ├── auth.service.ts
│   ├── board.service.ts
│   ├── list.service.ts
│   └── card.service.ts
├── controllers/       # Controladores da API
│   ├── auth.controller.ts
│   └── board.controller.ts
├── guards/           # Guards de autenticação
│   └── jwt-auth.guard.ts
├── strategies/       # Estratégias de autenticação
│   └── jwt.strategy.ts
├── modules/          # Módulos da aplicação
│   ├── auth.module.ts
│   └── board.module.ts
└── main.ts           # Ponto de entrada
```

## 🗄️ Banco de Dados

### Tabelas Principais
- `users` - Usuários do sistema
- `boards` - Quadros de tarefas
- `lists` - Listas/colunas dos quadros
- `cards` - Cartões/tarefas das listas
- `labels` - Etiquetas coloridas
- `checklists` - Listas de verificação
- `checklist_items` - Itens das checklists
- `comments` - Comentários dos cards
- `board_members` - Membros dos quadros

### Relacionamentos
- Usuários podem ter múltiplos quadros
- Quadros contêm múltiplas listas
- Listas contêm múltiplos cards
- Cards podem ter múltiplas etiquetas
- Cards podem ter múltiplas checklists
- Cards podem ter múltiplos comentários
- Sistema de permissões por quadro

## 🚀 Instalação e Configuração

### Pré-requisitos
- Node.js 18+
- PostgreSQL 12+
- Yarn ou npm

### 1. Clone o repositório
```bash
git clone <repository-url>
cd meu-projeto-backend
```

### 2. Instale as dependências
```bash
yarn install
```

### 3. Configure o banco de dados
```bash
# Crie um banco PostgreSQL chamado 'trello_db'
createdb trello_db

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

### 4. Execute as migrações
```bash
# O TypeORM irá sincronizar automaticamente em desenvolvimento
yarn start:dev
```

### 5. Inicie a aplicação
```bash
# Desenvolvimento
yarn start:dev

# Produção
yarn build
yarn start:prod
```

## 📚 API Endpoints

### Autenticação
- `POST /auth/register` - Registrar usuário
- `POST /auth/login` - Login
- `GET /auth/profile` - Perfil do usuário
- `PUT /auth/profile` - Atualizar perfil

### Quadros
- `POST /boards` - Criar quadro
- `GET /boards` - Listar quadros do usuário
- `GET /boards/:id` - Obter quadro específico
- `PUT /boards/:id` - Atualizar quadro
- `DELETE /boards/:id` - Deletar quadro

### Membros dos Quadros
- `POST /boards/:id/members` - Adicionar membro
- `PUT /boards/:id/members/:memberId` - Atualizar permissões
- `DELETE /boards/:id/members/:memberId` - Remover membro

## 🔐 Autenticação

O sistema utiliza JWT (JSON Web Tokens) para autenticação:

1. **Registro**: Usuário cria conta com email e senha
2. **Login**: Usuário recebe token JWT válido por 7 dias
3. **Proteção**: Endpoints protegidos requerem token no header `Authorization: Bearer <token>`
4. **Validação**: Token é validado em cada requisição

## 🎯 Próximos Passos

### Funcionalidades Planejadas
- [ ] Sistema de notificações
- [ ] Histórico de atividades
- [ ] Templates de quadros
- [ ] Exportação de dados
- [ ] Integração com calendário
- [ ] Sistema de busca avançada
- [ ] Relatórios e analytics
- [ ] Integração com serviços externos

### Melhorias Técnicas
- [ ] Cache Redis para performance
- [ ] Testes automatizados
- [ ] CI/CD pipeline
- [ ] Monitoramento e logs
- [ ] Rate limiting
- [ ] Documentação OpenAPI/Swagger

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

Para suporte e dúvidas:
- Abra uma issue no GitHub
- Consulte a documentação do NestJS
- Entre em contato com a equipe de desenvolvimento

---

**Desenvolvido com ❤️ usando NestJS e TypeScript**
