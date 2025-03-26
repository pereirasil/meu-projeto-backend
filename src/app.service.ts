import { Injectable } from '@nestjs/common';
import * as express from 'express';
import * as http from 'http';
import * as socketIo from 'socket.io';
import * as cors from 'cors';

interface UserMap {
  [socketId: string]: string;
}

interface VoteMap {
  [socketId: string]: number;
}

interface SelectionMap {
  [socketId: string]: any; // Replace `any` with a specific type if known
}

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}

const app = express();
const server = http.createServer(app);
const io = new socketIo.Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST'],
  },
});

let users: UserMap = {};
let votes: VoteMap = {};
let selections: SelectionMap = {};
console.log('Servidor iniciado');

function updateUsers() {
  const userList = Object.entries(users).map(([socketId, username]) => ({
    socketId,
    username,
  }));
  io.emit('updateUsers', userList);
}

app.use(cors());

io.on('connection', (socket: socketIo.Socket) => {
  console.log(`Novo usuário conectado: ${socket.id}`);

  socket.onAny((event: string, data: any) => {
    console.log(`Evento recebido: ${event}`, data);
  });

  socket.on('join', (username: string) => {
    if (!username || typeof username !== 'string' || username.trim() === '') {
      return;
    }

    users[socket.id] = username.trim();
    console.log(`Usuário conectado: ${username} (ID: ${socket.id})`);
    updateUsers();
  });

  socket.on('vote', (voteData: { vote: number }) => {
    if (!users[socket.id] || typeof voteData.vote !== 'number') {
      return;
    }
    votes[socket.id] = voteData.vote;
    console.log(`Voto recebido: ${users[socket.id]} votou em ${voteData.vote}`);
    io.emit('newVote', { username: users[socket.id], vote: 'X' });
  });

  socket.on('selectCard', (selectionData: any) => {
    if (!users[socket.id]) {
      return;
    }

    selections[socket.id] = selectionData;
    io.emit('cardSelected', selectionData);
  });

  socket.on('revealVotes', () => {
    const revealedVotes = Object.entries(users).map(([socketId, username]) => ({
      username,
      vote: votes[socketId] ?? '?',
    }));

    const voteValues = Object.values(votes).map(Number).filter((v) => !isNaN(v));
    const averageVote =
      voteValues.length > 0
        ? (voteValues.reduce((a, b) => a + b, 0) / voteValues.length).toFixed(2)
        : '0.00';

    console.log('Votos revelados:', revealedVotes);

    io.emit('showVotes', { revealedVotes, averageVote });
  });

  // Handle user logout
  socket.on('leave', (username: string) => {
    console.log(`Usuário saiu: ${username} (ID: ${socket.id})`);
    delete users[socket.id];
    delete votes[socket.id];
    delete selections[socket.id];
    updateUsers();
  });

  socket.on('disconnect', () => {
    console.log(`Usuário desconectado: ${socket.id}`);
    delete users[socket.id];
    delete votes[socket.id];
    delete selections[socket.id];
    updateUsers();
  });
});

const PORT = parseInt(process.env.PORT || '3001', 10); // Convert PORT to a number
const HOST = '0.0.0.0';

server.listen(PORT, HOST, () => {
  console.log(`Servidor rodando em http://${HOST}:${PORT}`);
});