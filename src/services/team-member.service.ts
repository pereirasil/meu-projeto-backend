import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamMember, TeamRole } from '../entities/team-member.entity';
import { TeamInvite, InviteStatus } from '../entities/team-invite.entity';
import { User } from '../entities/user.entity';
import { Board } from '../entities/board.entity';
import { CreateTeamMemberDto, UpdateTeamMemberDto, InviteTeamMemberDto, AcceptInviteDto, UpdateInviteDto } from '../dto/team-member.dto';
import * as crypto from 'crypto';

@Injectable()
export class TeamMemberService {
  constructor(
    @InjectRepository(TeamMember)
    private teamMemberRepository: Repository<TeamMember>,
    @InjectRepository(TeamInvite)
    private teamInviteRepository: Repository<TeamInvite>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
  ) {}

  async getBoardMembers(boardId: number, userId: number): Promise<TeamMember[]> {
    return await this.teamMemberRepository.find({
      where: { board_id: boardId, is_active: true },
      relations: ['user'],
      order: { created_at: 'ASC' },
    });
  }

  async addMemberToBoard(userId: number, createTeamMemberDto: CreateTeamMemberDto): Promise<TeamMember> {
    // Verificar se o usuário já é membro do board
    const existingMember = await this.teamMemberRepository.findOne({
      where: {
        user_id: createTeamMemberDto.user_id,
        board_id: createTeamMemberDto.board_id,
      },
    });

    if (existingMember) {
      if (existingMember.is_active) {
        throw new ConflictException('Usuário já é membro deste board');
      } else {
        // Reativar membro existente
        existingMember.is_active = true;
        existingMember.role = createTeamMemberDto.role || TeamRole.MEMBER;
        return await this.teamMemberRepository.save(existingMember);
      }
    }

    const teamMember = this.teamMemberRepository.create({
      ...createTeamMemberDto,
      role: createTeamMemberDto.role || TeamRole.MEMBER,
    });

    return await this.teamMemberRepository.save(teamMember);
  }

  async updateMemberRole(memberId: number, userId: number, updateTeamMemberDto: UpdateTeamMemberDto): Promise<TeamMember> {
    const member = await this.teamMemberRepository.findOne({
      where: { id: memberId },
      relations: ['board'],
    });

    if (!member) {
      throw new NotFoundException('Membro não encontrado');
    }

    Object.assign(member, updateTeamMemberDto);
    return await this.teamMemberRepository.save(member);
  }

  async removeMemberFromBoard(memberId: number, userId: number): Promise<void> {
    const member = await this.teamMemberRepository.findOne({
      where: { id: memberId },
    });

    if (!member) {
      throw new NotFoundException('Membro não encontrado');
    }

    await this.teamMemberRepository.remove(member);
  }

  async inviteMemberToBoard(userId: number, inviteTeamMemberDto: InviteTeamMemberDto): Promise<TeamInvite> {
    // Verificar se já existe convite pendente para este email
    const existingInvite = await this.teamInviteRepository.findOne({
      where: {
        email: inviteTeamMemberDto.email,
        board_id: inviteTeamMemberDto.board_id,
        status: InviteStatus.PENDING,
      },
    });

    if (existingInvite) {
      throw new ConflictException('Já existe um convite pendente para este email');
    }

    // Verificar se o usuário já é membro do board
    const user = await this.userRepository.findOne({
      where: { email: inviteTeamMemberDto.email },
    });

    if (user) {
      const existingMember = await this.teamMemberRepository.findOne({
        where: {
          user_id: user.id,
          board_id: inviteTeamMemberDto.board_id,
          is_active: true,
        },
      });

      if (existingMember) {
        throw new ConflictException('Usuário já é membro deste board');
      }
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expira em 7 dias

    const invite = this.teamInviteRepository.create({
      ...inviteTeamMemberDto,
      token,
      expires_at: expiresAt,
      invited_by: userId,
      role: inviteTeamMemberDto.role || TeamRole.MEMBER,
    });

    return await this.teamInviteRepository.save(invite);
  }

  async getBoardInvites(boardId: number, userId: number): Promise<TeamInvite[]> {
    return await this.teamInviteRepository.find({
      where: { board_id: boardId },
      order: { created_at: 'DESC' },
    });
  }

  async acceptInvite(userId: number, acceptInviteDto: AcceptInviteDto): Promise<TeamMember> {
    const invite = await this.teamInviteRepository.findOne({
      where: { token: acceptInviteDto.token },
      relations: ['board'],
    });

    if (!invite) {
      throw new NotFoundException('Convite não encontrado');
    }

    if (invite.status !== InviteStatus.PENDING) {
      throw new BadRequestException('Convite já foi processado');
    }

    if (invite.expires_at < new Date()) {
      invite.status = InviteStatus.EXPIRED;
      await this.teamInviteRepository.save(invite);
      throw new BadRequestException('Convite expirado');
    }

    // Verificar se o usuário existe
    const user = await this.userRepository.findOne({
      where: { email: invite.email },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Adicionar usuário ao board
    const teamMember = this.teamMemberRepository.create({
      user_id: user.id,
      board_id: invite.board_id,
      role: invite.role,
    });

    const savedMember = await this.teamMemberRepository.save(teamMember);

    // Marcar convite como aceito
    invite.status = InviteStatus.ACCEPTED;
    await this.teamInviteRepository.save(invite);

    return savedMember;
  }

  async updateInviteStatus(inviteId: number, userId: number, updateInviteDto: UpdateInviteDto): Promise<TeamInvite> {
    const invite = await this.teamInviteRepository.findOne({
      where: { id: inviteId },
    });

    if (!invite) {
      throw new NotFoundException('Convite não encontrado');
    }

    Object.assign(invite, updateInviteDto);
    return await this.teamInviteRepository.save(invite);
  }

  async deleteInvite(inviteId: number, userId: number): Promise<void> {
    const invite = await this.teamInviteRepository.findOne({
      where: { id: inviteId },
    });

    if (!invite) {
      throw new NotFoundException('Convite não encontrado');
    }

    await this.teamInviteRepository.remove(invite);
  }
}
