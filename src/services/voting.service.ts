import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { VotingRoom } from '../entities/voting-room.entity';
import { VotingParticipant } from '../entities/voting-participant.entity';
import { VotingVote } from '../entities/voting-vote.entity';
import { VotingMessage } from '../entities/voting-message.entity';
import { CreateVotingRoomDto, JoinRoomDto, VoteDto, ChatMessageDto, LeaveRoomDto } from '../dto/voting.dto';

@Injectable()
export class VotingService {
  constructor(
    @InjectRepository(VotingRoom)
    private votingRoomRepository: Repository<VotingRoom>,
    @InjectRepository(VotingParticipant)
    private votingParticipantRepository: Repository<VotingParticipant>,
    @InjectRepository(VotingVote)
    private votingVoteRepository: Repository<VotingVote>,
    @InjectRepository(VotingMessage)
    private votingMessageRepository: Repository<VotingMessage>,
  ) {}

  async createRoom(createRoomDto: CreateVotingRoomDto, userId: number): Promise<{ roomId: string; name: string }> {
    const roomId = randomUUID();
    
    const room = this.votingRoomRepository.create({
      id: roomId,
      name: createRoomDto.name,
      created_by: userId,
      is_active: true,
    });

    await this.votingRoomRepository.save(room);

    return { roomId, name: createRoomDto.name };
  }

  async getRoom(roomId: string): Promise<VotingRoom> {
    const room = await this.votingRoomRepository.findOne({
      where: { id: roomId, is_active: true },
      relations: ['participants', 'votes', 'messages'],
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    return room;
  }

  async getActiveRooms(): Promise<any[]> {
    const rooms = await this.votingRoomRepository.find({
      where: { is_active: true },
      relations: ['participants'],
    });

    return rooms.map(room => ({
      id: room.id,
      name: room.name,
      participants: room.participants.length,
      createdAt: room.created_at,
    }));
  }

  async joinRoom(joinRoomDto: JoinRoomDto, socketId: string): Promise<VotingRoom> {
    const room = await this.getRoom(joinRoomDto.roomId);

    // Verificar se o participante já existe
    let participant = await this.votingParticipantRepository.findOne({
      where: { 
        room_id: joinRoomDto.roomId,
        user_name: joinRoomDto.userName 
      },
    });

    if (participant) {
      // Atualizar informações do participante existente
      participant.socket_id = socketId;
      participant.is_connected = true;
      participant.user_role = joinRoomDto.userRole || participant.user_role;
      participant.avatar_url = joinRoomDto.avatar || participant.avatar_url;
    } else {
      // Criar novo participante
      participant = this.votingParticipantRepository.create({
        room_id: joinRoomDto.roomId,
        user_name: joinRoomDto.userName,
        user_role: joinRoomDto.userRole || 'participant',
        avatar_url: joinRoomDto.avatar,
        socket_id: socketId,
        is_connected: true,
      });
    }

    await this.votingParticipantRepository.save(participant);

    return this.getRoom(joinRoomDto.roomId);
  }

  async leaveRoom(leaveRoomDto: LeaveRoomDto): Promise<void> {
    const participant = await this.votingParticipantRepository.findOne({
      where: { 
        room_id: leaveRoomDto.roomId,
        user_name: leaveRoomDto.userName 
      },
    });

    if (participant) {
      participant.is_connected = false;
      participant.socket_id = null;
      await this.votingParticipantRepository.save(participant);
    }
  }

  async vote(voteDto: VoteDto, socketId: string): Promise<VotingVote> {
    const room = await this.getRoom(voteDto.roomId);

    // Verificar se já existe um voto para este usuário nesta sala
    const existingVote = await this.votingVoteRepository.findOne({
      where: { 
        room_id: voteDto.roomId,
        user_name: voteDto.userName 
      },
    });

    if (existingVote) {
      // Atualizar voto existente
      existingVote.vote_value = voteDto.vote;
      existingVote.socket_id = socketId;
      return await this.votingVoteRepository.save(existingVote);
    } else {
      // Criar novo voto
      const vote = this.votingVoteRepository.create({
        room_id: voteDto.roomId,
        user_name: voteDto.userName,
        socket_id: socketId,
        vote_value: voteDto.vote,
        is_revealed: false,
      });

      return await this.votingVoteRepository.save(vote);
    }
  }

  async revealVotes(roomId: string): Promise<VotingVote[]> {
    const room = await this.getRoom(roomId);
    
    // Marcar todos os votos como revelados
    await this.votingVoteRepository.update(
      { room_id: roomId },
      { is_revealed: true }
    );

    // Retornar votos revelados
    return await this.votingVoteRepository.find({
      where: { room_id: roomId },
    });
  }

  async resetVoting(roomId: string): Promise<void> {
    const room = await this.getRoom(roomId);
    
    // Deletar todos os votos da sala
    await this.votingVoteRepository.delete({ room_id: roomId });
  }

  async sendMessage(messageDto: ChatMessageDto, socketId: string, userName: string, avatarUrl?: string): Promise<VotingMessage> {
    const room = await this.getRoom(messageDto.roomId);

    const message = this.votingMessageRepository.create({
      room_id: messageDto.roomId,
      user_name: userName,
      socket_id: socketId,
      avatar_url: avatarUrl,
      message: messageDto.message,
    });

    return await this.votingMessageRepository.save(message);
  }

  async getChatHistory(roomId: string, limit: number = 100): Promise<VotingMessage[]> {
    const room = await this.getRoom(roomId);

    return await this.votingMessageRepository.find({
      where: { room_id: roomId },
      order: { created_at: 'DESC' },
      take: limit,
    });
  }

  async deactivateRoom(roomId: string, userId: number): Promise<void> {
    const room = await this.votingRoomRepository.findOne({
      where: { id: roomId, created_by: userId },
    });

    if (!room) {
      throw new NotFoundException('Room not found or you are not the creator');
    }

    room.is_active = false;
    await this.votingRoomRepository.save(room);
  }
}
