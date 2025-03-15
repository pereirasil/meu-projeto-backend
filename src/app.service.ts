import { Injectable } from '@nestjs/common';
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*', // Definir origem em variáveis de ambiente para produção
    methods: ['GET', 'POST']
  }
});

let users = {}; // Mapeia socket.id -> username
let votes = {}; // Mapeia socket.id -> voto
let selections = {}; // Mapeia socket.id -> seleção de carta e cor
console.log('Servidor iniciado');
// Atualiza e emite a lista de usuários para todos os clientes
function updateUsers() {
  const userList = Object.entries(users).map(([socketId, username]) => ({
    socketId,
    username
  }));
  io.emit('updateUsers', userList);
}

app.use(cors()); // Habilita CORS globalmente

io.on('connection', (socket) => {
  console.log(`Novo usuário conectado: ${socket.id}`);

  socket.onAny((event, data) => {
    console.log(`Evento recebido: ${event}`, data);
  });

  // Usuário se junta à sessão
  socket.on('join', (username) => {
    if (!username || typeof username !== 'string' || username.trim() === '') {
      return; // Evita nomes inválidos
    }

    users[socket.id] = username.trim();
    console.log(`Usuário conectado: ${username} (ID: ${socket.id})`);
    updateUsers();
  });

  // Usuário vota
  socket.on('vote', (voteData) => {
    if (!users[socket.id] || typeof voteData.vote !== 'number') {
      return;
    }
    votes[socket.id] = voteData.vote;
    console.log(`Voto recebido: ${users[socket.id]} votou em ${voteData.vote}`);
    io.emit('newVote', { username: users[socket.id], vote: 'X' }); // mantém o voto oculto para os demais
  });
  
  // Usuário seleciona uma carta
  socket.on('selectCard', (selectionData) => {
    if (!users[socket.id]) {
      return;
    }

    selections[socket.id] = selectionData;
    io.emit('cardSelected', selectionData);
  });

  // Revela os votos
  socket.on('revealVotes', () => {
    const revealedVotes = Object.entries(users).map(([socketId, username]) => ({
      username,
      vote: votes[socketId] ?? '?'
    }));
    
    const voteValues = Object.values(votes).map(Number).filter(v => !isNaN(v));
    const averageVote = voteValues.length > 0
      ? (voteValues.reduce((a, b) => a + b, 0) / voteValues.length).toFixed(2)
      : '0.00';

    console.log('Votos revelados:', revealedVotes); // Adiciona o console.log para exibir os votos

    io.emit('showVotes', { revealedVotes, averageVote });
  });

  // Usuário se desconecta
  socket.on('disconnect', () => {
    console.log(`Usuário desconectado: ${socket.id}`);
    delete users[socket.id];
    delete votes[socket.id];
    delete selections[socket.id];
    updateUsers();
  });
});

// Configuração da porta e do IP
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

server.listen(PORT, HOST, () => {
  console.log(`Servidor rodando em http://${HOST}:${PORT}`);
});