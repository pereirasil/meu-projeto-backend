import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from '../entities/user.entity';
import { BoardMember } from '../entities/board-member.entity';
import { Board } from '../entities/board.entity';
import { InviteMemberDto, UpdateMemberDto } from '../dto/team.dto';

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(BoardMember)
    private boardMemberRepository: Repository<BoardMember>,
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
  ) {}

  async getTeamMembers(userId: number): Promise<any[]> {
    // Buscar todos os boards do usuário
    const userBoards = await this.boardRepository.find({
      where: { user_id: userId }
    });

    const boardIds = userBoards.map(board => board.id);

    // Buscar todos os membros dos boards do usuário
    let members = [];
    if (boardIds.length > 0) {
      members = await this.boardMemberRepository.find({
        where: { board_id: In(boardIds) },
        relations: ['user', 'board']
      });
    }

    // Agrupar membros por usuário e incluir informações dos boards
    const memberMap = new Map();
    
    members.forEach(member => {
      const userId = member.user.id;
      if (!memberMap.has(userId)) {
        memberMap.set(userId, {
          id: member.user.id,
          name: member.user.name,
          email: member.user.email,
          avatar_url: member.user.avatar_url,
          boards: []
        });
      }
      
      memberMap.get(userId).boards.push({
        board_id: member.board.id,
        board_title: member.board.title,
        role: member.role,
        joined_at: member.joined_at
      });
    });

    return Array.from(memberMap.values());
  }

  async inviteMember(userId: number, inviteMemberDto: InviteMemberDto): Promise<any> {
    const { email, board_id, role = 'member' } = inviteMemberDto;

    // Verificar se o usuário existe
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Verificar se o board existe e se o usuário tem permissão
    const board = await this.boardRepository.findOne({ where: { id: board_id } });
    if (!board) {
      throw new NotFoundException('Board não encontrado');
    }

    if (board.user_id !== userId) {
      throw new ForbiddenException('Sem permissão para adicionar membros a este board');
    }

    // Verificar se o usuário já é membro do board
    const existingMember = await this.boardMemberRepository.findOne({
      where: { board_id, user_id: user.id }
    });

    if (existingMember) {
      throw new BadRequestException('Usuário já é membro deste board');
    }

    // Adicionar membro ao board
    const boardMember = this.boardMemberRepository.create({
      board_id,
      user_id: user.id,
      role: role as 'owner' | 'admin' | 'member'
    });

    const savedMember = await this.boardMemberRepository.save(boardMember);

    return {
      id: savedMember.user_id,
      name: user.name,
      email: user.email,
      avatar_url: user.avatar_url,
      role: savedMember.role,
      joined_at: savedMember.joined_at
    };
  }

  async updateMember(userId: number, memberId: number, updateMemberDto: UpdateMemberDto): Promise<any> {
    const { board_id, role } = updateMemberDto;

    // Verificar se o board existe e se o usuário tem permissão
    const board = await this.boardRepository.findOne({ where: { id: board_id } });
    if (!board) {
      throw new NotFoundException('Board não encontrado');
    }

    if (board.user_id !== userId) {
      throw new ForbiddenException('Sem permissão para atualizar membros deste board');
    }

    // Verificar se o membro existe
    const member = await this.boardMemberRepository.findOne({
      where: { board_id, user_id: memberId },
      relations: ['user']
    });

    if (!member) {
      throw new NotFoundException('Membro não encontrado');
    }

    // Atualizar role do membro
    member.role = role as 'owner' | 'admin' | 'member';
    await this.boardMemberRepository.save(member);

    return {
      id: member.user.id,
      name: member.user.name,
      email: member.user.email,
      avatar_url: member.user.avatar_url,
      role: member.role,
      joined_at: member.joined_at
    };
  }

  async removeMember(userId: number, memberId: number): Promise<void> {
    // Buscar todos os boards do usuário
    const userBoards = await this.boardRepository.find({
      where: { user_id: userId }
    });

    const boardIds = userBoards.map(board => board.id);

    if (boardIds.length === 0) {
      throw new NotFoundException('Nenhum board encontrado para este usuário');
    }

    // Buscar o membro em qualquer board do usuário
    const member = await this.boardMemberRepository
      .createQueryBuilder('boardMember')
      .where('boardMember.user_id = :memberId', { memberId })
      .andWhere('boardMember.board_id IN (:...boardIds)', { boardIds })
      .getOne();

    if (!member) {
      throw new NotFoundException('Membro não encontrado ou sem permissão para removê-lo');
    }

    await this.boardMemberRepository.remove(member);
  }
}
