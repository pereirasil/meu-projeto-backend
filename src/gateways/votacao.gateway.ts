import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

interface User {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
}

interface Room {
  id: string;
  name: string;
  users: User[];
  votes: Record<string, number>;
  isRevealed: boolean;
}

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:5002', 'http://192.168.0.127:5002'],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['polling', 'websocket'],
  path: '/socket.io/'
})
export class VotacaoGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private rooms: Map<string, Room> = new Map();

  handleConnection(client: Socket) {
    console.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Cliente desconectado: ${client.id}`);
    // Remover usuário de todas as salas
    this.rooms.forEach((room, roomId) => {
      const userIndex = room.users.findIndex(user => user.id === client.id);
      if (userIndex !== -1) {
        room.users.splice(userIndex, 1);
        delete room.votes[client.id];
        this.server.to(roomId).emit('updateUsers', room.users);
      }
    });
  }

  @SubscribeMessage('createRoom')
  handleCreateRoom(client: Socket, data: { roomName: string; userName: string }) {
    const roomId = Math.random().toString(36).substring(2, 8);
    const newRoom: Room = {
      id: roomId,
      name: data.roomName,
      users: [{
        id: client.id,
        name: data.userName,
        role: 'moderator'
      }],
      votes: {},
      isRevealed: false
    };

    this.rooms.set(roomId, newRoom);
    client.join(roomId);
    client.emit('roomCreated', { roomId });
    return { roomId };
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, data: { roomId: string; userName: string; userRole?: string; avatar?: string }) {
    const room = this.rooms.get(data.roomId);
    if (!room) {
      client.emit('error', { message: 'Sala não encontrada' });
      return;
    }

    // Verifica se o usuário já existe na sala
    const existingUser = room.users.find(user => user.id === client.id);
    if (existingUser) {
      // Se o usuário já existe, apenas atualiza as informações
      existingUser.name = data.userName;
      existingUser.role = data.userRole || existingUser.role;
      existingUser.avatar = data.avatar || existingUser.avatar;
    } else {
      // Se o usuário não existe, adiciona como novo
      const newUser: User = {
        id: client.id,
        name: data.userName,
        role: data.userRole || 'participant',
        avatar: data.avatar
      };
      room.users.push(newUser);
    }

    client.join(data.roomId);

    this.server.to(data.roomId).emit('userJoined', {
      users: room.users,
      isRevealed: room.isRevealed,
      votes: room.isRevealed ? room.votes : undefined
    });

    return { success: true };
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(client: Socket, data: { roomId: string; userName: string }) {
    const room = this.rooms.get(data.roomId);
    if (room) {
      const userIndex = room.users.findIndex(user => user.id === client.id);
      if (userIndex !== -1) {
        room.users.splice(userIndex, 1);
        delete room.votes[client.id];
        client.leave(data.roomId);
        this.server.to(data.roomId).emit('updateUsers', room.users);
      }
    }
  }

  @SubscribeMessage('vote')
  handleVote(client: Socket, data: { roomId: string; userName: string; vote: number }) {
    const room = this.rooms.get(data.roomId);
    if (room && !room.isRevealed) {
      // Salva o voto
      room.votes[client.id] = data.vote;
      
      // Envia o evento newVote para todos na sala
      this.server.to(data.roomId).emit('newVote', {
        userName: data.userName,
        hasVoted: true
      });
      
      // Verifica se todos votaram para possível automação futura
      const totalVotes = Object.keys(room.votes).length;
      const totalUsers = room.users.length;
      
      if (totalVotes === totalUsers) {
        this.server.to(data.roomId).emit('allVoted', true);
      }
    }
  }

  @SubscribeMessage('revealVotes')
  handleRevealVotes(client: Socket, roomId: string) {
    const room = this.rooms.get(roomId);
    if (room) {
      room.isRevealed = true;
      const votes = Object.entries(room.votes).map(([userId, vote]) => {
        const user = room.users.find(u => u.id === userId);
        return {
          userName: user?.name || 'Desconhecido',
          vote
        };
      });

      this.server.to(roomId).emit('votesRevealed', { votes });
    }
  }

  @SubscribeMessage('resetVoting')
  handleResetVoting(client: Socket, roomId: string) {
    const room = this.rooms.get(roomId);
    if (room) {
      room.isRevealed = false;
      room.votes = {};
      this.server.to(roomId).emit('votingReset');
    }
  }
} 