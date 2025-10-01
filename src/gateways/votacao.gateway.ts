import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { VotingService } from '../services/voting.service';
import { JoinRoomDto, VoteDto, ChatMessageDto, LeaveRoomDto } from '../dto/voting.dto';

interface User {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
}

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
}

interface Room {
  id: string;
  name: string;
  users: User[];
  votes: Record<string, number>;
  isRevealed: boolean;
  messages: ChatMessage[];
  createdAt: Date;
}

@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:5000', 
      'http://localhost:5001',
      'http://192.168.0.127:5000',
      'https://timeboard.site',
      'https://app.timeboard.site'
    ],
    credentials: true,
  },
  transports: ['polling', 'websocket'],
  path: '/socket.io/',
  pingTimeout: 60000,
  pingInterval: 25000,
  connectTimeout: 45000,
  allowUpgrades: true,
  cookie: false
})
export class VotacaoGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('VotacaoGateway');
  private rooms: Map<string, any> = new Map();

  constructor(
    private readonly votingService: VotingService,
    private readonly jwtService: JwtService
  ) {}

  async handleConnection(client: Socket) {
    try {
      this.logger.log(`Cliente conectado: ${client.id}`);
      
      // Verificar autenticação JWT
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.replace('Bearer ', '');
      
      if (token) {
        try {
          const payload = await this.jwtService.verifyAsync(token);
          this.logger.log(`Usuário autenticado: ${payload.email} (ID: ${payload.sub})`);
          
          // Armazenar informações do usuário no socket
          client.data.user = {
            id: payload.sub,
            email: payload.email,
            name: payload.name || payload.email
          };
          
          client.emit('connected', { 
            message: 'Conectado ao servidor de votação',
            clientId: client.id,
            user: client.data.user,
            timestamp: new Date()
          });
        } catch (jwtError) {
          this.logger.warn(`Token JWT inválido para cliente ${client.id}:`, jwtError.message);
          client.emit('auth_error', { message: 'Token inválido' });
          client.disconnect();
          return;
        }
      } else {
        this.logger.warn(`Cliente ${client.id} conectou sem token de autenticação`);
        // Permitir conexão sem autenticação para compatibilidade com o sistema atual
        client.emit('connected', { 
          message: 'Conectado ao servidor de votação (sem autenticação)',
          clientId: client.id,
          timestamp: new Date()
        });
      }
    } catch (error) {
      this.logger.error(`Erro ao processar conexão do cliente ${client.id}:`, error);
      client.emit('error', { message: 'Erro interno do servidor' });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente desconectado: ${client.id}`);
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
  async handleCreateRoom(@ConnectedSocket() client: Socket, @MessageBody() data: { roomName: string; userName: string }) {
    try {
      // Criar sala usando o serviço (requer autenticação JWT)
      // Por enquanto, vamos manter a lógica original para compatibilidade
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
        isRevealed: false,
        messages: [],
        createdAt: new Date()
      };

      this.rooms.set(roomId, newRoom);
      client.join(roomId);
      client.emit('roomCreated', { roomId });
      return { roomId };
    } catch (error) {
      this.logger.error('Error creating room:', error);
      client.emit('error', { message: 'Failed to create room' });
    }
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() data: JoinRoomDto) {
    try {
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
        votes: room.isRevealed ? room.votes : undefined,
        messages: room.messages
      });

      // Enviar histórico de chat para o usuário que acabou de entrar
      client.emit('chatHistory', room.messages);

      return { success: true };
    } catch (error) {
      this.logger.error('Error joining room:', error);
      client.emit('error', { message: 'Failed to join room' });
    }
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

  @SubscribeMessage('activeRooms')
  handleActiveRooms(client: Socket) {
    const activeRooms = Array.from(this.rooms.values()).map(room => ({
      id: room.id,
      name: room.name,
      participants: room.users.length,
      isRevealed: room.isRevealed,
      createdAt: room.createdAt || new Date()
    }));

    client.emit('activeRooms', activeRooms);
    return { rooms: activeRooms };
  }

  @SubscribeMessage('chatMessage')
  handleChatMessage(client: Socket, data: { roomId: string; message: string }) {
    const room = this.rooms.get(data.roomId);
    if (!room) {
      client.emit('error', { message: 'Sala não encontrada' });
      return;
    }

    const user = room.users.find(u => u.id === client.id);
    if (!user) {
      client.emit('error', { message: 'Usuário não encontrado na sala' });
      return;
    }

    const newMessage: ChatMessage = {
      id: Math.random().toString(36).substring(2, 15),
      userId: client.id,
      userName: user.name,
      message: data.message,
      timestamp: new Date()
    };

    // Adiciona a mensagem ao histórico da sala
    room.messages.push(newMessage);

    // Limita o histórico a 100 mensagens para não sobrecarregar a memória
    if (room.messages.length > 100) {
      room.messages = room.messages.slice(-100);
    }

    // Envia a mensagem para todos na sala
    this.server.to(data.roomId).emit('newChatMessage', newMessage);

    this.logger.log(`Nova mensagem em ${room.name} de ${user.name}: ${data.message}`);
    return { success: true };
  }
} 