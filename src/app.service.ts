import { Injectable } from '@nestjs/common';
import * as express from 'express';
import * as http from 'http';
import * as socketIo from 'socket.io';
import * as cors from 'cors';

interface User {
  id: string;
  name: string;
}

interface Room {
  id: string;
  name: string;
  users: { [socketId: string]: User };
  votes: { [socketId: string]: number };
  isRevealed: boolean;
}

@Injectable()
export class AppService {
  private app: express.Application;
  private server: http.Server;
  private io: socketIo.Server;
  private rooms: { [roomId: string]: Room } = {};

  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.io = new socketIo.Server(this.server, {
      cors: {
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST'],
      },
    });

    this.app.use(cors());
    this.setupWebSocket();
    this.startServer();
  }

  getHello(): string {
    return 'Hello World!';
  }

  private generateRoomId(): string {
    return Math.random().toString(36).substring(7);
  }

  private updateRoomUsers(roomId: string) {
    const room = this.rooms[roomId];
    if (room) {
      const userList = Object.values(room.users);
      this.io.to(roomId).emit('updateUsers', userList);
    }
  }

  private setupWebSocket() {
    this.io.on('connection', (socket: socketIo.Socket) => {
      console.log(`Novo usuário conectado: ${socket.id}`);

      socket.onAny((event: string, data: any) => {
        console.log(`Evento recebido: ${event}`, data);
      });

      socket.on('createRoom', (data: { roomName: string; userName: string }) => {
        const roomId = this.generateRoomId();
        const newRoom: Room = {
          id: roomId,
          name: data.roomName,
          users: {},
          votes: {},
          isRevealed: false,
        };

        newRoom.users[socket.id] = {
          id: socket.id,
          name: data.userName,
        };

        this.rooms[roomId] = newRoom;
        socket.join(roomId);

        socket.emit('roomCreated', {
          roomId,
          roomName: data.roomName,
          users: Object.values(newRoom.users),
        });
      });

      socket.on('joinRoom', (data: { roomId: string; userName: string }) => {
        const room = this.rooms[data.roomId];
        if (!room) {
          socket.emit('error', { message: 'Sala não encontrada' });
          return;
        }

        room.users[socket.id] = {
          id: socket.id,
          name: data.userName,
        };

        socket.join(data.roomId);
        this.updateRoomUsers(data.roomId);

        this.io.to(data.roomId).emit('userJoined', {
          userId: socket.id,
          userName: data.userName,
          users: Object.values(room.users),
          isRevealed: room.isRevealed,
          votes: room.isRevealed ? room.votes : null,
        });
      });

      socket.on('vote', (data: { roomId: string; vote: number }) => {
        const room = this.rooms[data.roomId];
        if (!room || !room.users[socket.id]) {
          socket.emit('error', { message: 'Sala ou usuário inválido' });
          return;
        }

        room.votes[socket.id] = data.vote;
        this.io.to(data.roomId).emit('newVote', {
          userId: socket.id,
          userName: room.users[socket.id].name,
          hasVoted: true,
        });
      });

      socket.on('revealVotes', (roomId: string) => {
        const room = this.rooms[roomId];
        if (!room || !room.users[socket.id]) {
          socket.emit('error', { message: 'Sala ou usuário inválido' });
          return;
        }

        room.isRevealed = true;
        const revealedVotes = Object.entries(room.votes).map(([userId, vote]) => ({
          userId,
          userName: room.users[userId].name,
          vote,
        }));

        const voteValues = Object.values(room.votes).map(Number).filter((v) => !isNaN(v));
        const averageVote = voteValues.length > 0
          ? (voteValues.reduce((a, b) => a + b, 0) / voteValues.length).toFixed(2)
          : '0.00';

        this.io.to(roomId).emit('votesRevealed', {
          votes: revealedVotes,
          average: averageVote,
        });
      });

      socket.on('resetVoting', (roomId: string) => {
        const room = this.rooms[roomId];
        if (!room || !room.users[socket.id]) {
          socket.emit('error', { message: 'Sala ou usuário inválido' });
          return;
        }

        room.votes = {};
        room.isRevealed = false;
        this.io.to(roomId).emit('votingReset', {
          message: `Nova votação iniciada por ${room.users[socket.id].name}`,
        });
      });

      socket.on('leaveRoom', (roomId: string) => {
        const room = this.rooms[roomId];
        if (!room) return;

        delete room.users[socket.id];
        delete room.votes[socket.id];

        if (Object.keys(room.users).length === 0) {
          delete this.rooms[roomId];
        } else {
          socket.leave(roomId);
          this.updateRoomUsers(roomId);
          this.io.to(roomId).emit('userLeft', {
            userId: socket.id,
            users: Object.values(room.users),
          });
        }
      });

      socket.on('disconnect', () => {
        console.log(`Usuário desconectado: ${socket.id}`);
        Object.entries(this.rooms).forEach(([roomId, room]) => {
          if (room.users[socket.id]) {
            socket.emit('leaveRoom', roomId);
          }
        });
      });
    });
  }

  private startServer() {
    const PORT = parseInt(process.env.PORT || '3001', 10);
    const HOST = '192.168.0.127';

    this.server.listen(PORT, HOST, () => {
      console.log(`Servidor rodando em http://${HOST}:${PORT}`);
    });
  }
}