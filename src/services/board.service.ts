import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Board } from '../entities/board.entity';
import { List } from '../entities/list.entity';
import { Label } from '../entities/label.entity';
import { BoardMember } from '../entities/board-member.entity';
import { CreateBoardDto, UpdateBoardDto, AddBoardMemberDto, UpdateBoardMemberDto } from '../dto/board.dto';

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
    @InjectRepository(List)
    private listRepository: Repository<List>,
    @InjectRepository(Label)
    private labelRepository: Repository<Label>,
    @InjectRepository(BoardMember)
    private boardMemberRepository: Repository<BoardMember>,
  ) {}

  async createBoard(userId: number, createBoardDto: CreateBoardDto): Promise<Board> {
    const board = this.boardRepository.create({
      ...createBoardDto,
      user_id: userId,
    });

    const savedBoard = await this.boardRepository.save(board);

    // Adicionar usuário como owner
    await this.boardMemberRepository.save({
      board_id: savedBoard.id,
      user_id: userId,
      role: 'owner',
    });

    return savedBoard;
  }

  async getBoards(userId: number): Promise<Board[]> {
    return this.boardRepository
      .createQueryBuilder('board')
      .leftJoinAndSelect('board.lists', 'lists')
      .leftJoinAndSelect('board.labels', 'labels')
      .leftJoinAndSelect('board.members', 'members')
      .leftJoinAndSelect('members.user', 'memberUser')
      .where('board.user_id = :userId', { userId })
      .orWhere('board.is_public = true')
      .orWhere('members.user_id = :userId', { userId })
      .orderBy('board.updated_at', 'DESC')
      .getMany();
  }

  async getBoardById(boardId: number, userId: number): Promise<Board> {
    const board = await this.boardRepository
      .createQueryBuilder('board')
      .leftJoinAndSelect('board.lists', 'lists')
      .leftJoinAndSelect('lists.cards', 'cards')
      .leftJoinAndSelect('cards.labels', 'labels')
      .leftJoinAndSelect('cards.assigned_user', 'assignedUser')
      .leftJoinAndSelect('cards.checklists', 'checklists')
      .leftJoinAndSelect('checklists.items', 'checklistItems')
      .leftJoinAndSelect('cards.comments', 'comments')
      .leftJoinAndSelect('comments.user', 'commentUser')
      .leftJoinAndSelect('board.labels', 'boardLabels')
      .leftJoinAndSelect('board.members', 'members')
      .leftJoinAndSelect('members.user', 'memberUser')
      .where('board.id = :boardId', { boardId })
      .andWhere('(board.user_id = :userId OR board.is_public = true OR EXISTS (SELECT 1 FROM board_members bm WHERE bm.board_id = board.id AND bm.user_id = :userId))', { userId })
      .orderBy('lists.position', 'ASC')
      .addOrderBy('cards.position', 'ASC')
      .addOrderBy('checklists.position', 'ASC')
      .addOrderBy('checklistItems.position', 'ASC')
      .getOne();

    if (!board) {
      throw new NotFoundException('Quadro não encontrado');
    }

    return board;
  }

  async updateBoard(boardId: number, userId: number, updateBoardDto: UpdateBoardDto): Promise<Board> {
    const board = await this.boardRepository.findOne({ where: { id: boardId } });
    if (!board) {
      throw new NotFoundException('Quadro não encontrado');
    }

    // Verificar permissões
    if (board.user_id !== userId) {
      const member = await this.boardMemberRepository.findOne({
        where: { board_id: boardId, user_id: userId, role: 'admin' }
      });
      if (!member) {
        throw new ForbiddenException('Sem permissão para editar este quadro');
      }
    }

    Object.assign(board, updateBoardDto);
    return this.boardRepository.save(board);
  }

  async deleteBoard(boardId: number, userId: number): Promise<void> {
    const board = await this.boardRepository.findOne({ where: { id: boardId } });
    if (!board) {
      throw new NotFoundException('Quadro não encontrado');
    }

    if (board.user_id !== userId) {
      throw new ForbiddenException('Apenas o proprietário pode deletar o quadro');
    }

    await this.boardRepository.remove(board);
  }

  async addBoardMember(boardId: number, userId: number, addMemberDto: AddBoardMemberDto): Promise<BoardMember> {
    // Verificar se o usuário tem permissão para adicionar membros
    const board = await this.boardRepository.findOne({ where: { id: boardId } });
    if (!board) {
      throw new NotFoundException('Quadro não encontrado');
    }

    if (board.user_id !== userId) {
      const member = await this.boardMemberRepository.findOne({
        where: { board_id: boardId, user_id: userId, role: 'admin' }
      });
      if (!member) {
        throw new ForbiddenException('Sem permissão para adicionar membros');
      }
    }

    // Verificar se o membro já existe
    const existingMember = await this.boardMemberRepository.findOne({
      where: { board_id: boardId, user_id: addMemberDto.user_id }
    });

    if (existingMember) {
      throw new ForbiddenException('Usuário já é membro deste quadro');
    }

    const boardMember = this.boardMemberRepository.create({
      board_id: boardId,
      user_id: addMemberDto.user_id,
      role: addMemberDto.role,
    });

    return this.boardMemberRepository.save(boardMember);
  }

  async updateBoardMember(boardId: number, userId: number, memberUserId: number, updateMemberDto: UpdateBoardMemberDto): Promise<BoardMember> {
    // Verificar permissões
    const board = await this.boardRepository.findOne({ where: { id: boardId } });
    if (!board) {
      throw new NotFoundException('Quadro não encontrado');
    }

    if (board.user_id !== userId) {
      const member = await this.boardMemberRepository.findOne({
        where: { board_id: boardId, user_id: userId, role: 'admin' }
      });
      if (!member) {
        throw new ForbiddenException('Sem permissão para editar membros');
      }
    }

    const boardMember = await this.boardMemberRepository.findOne({
      where: { board_id: boardId, user_id: memberUserId }
    });

    if (!boardMember) {
      throw new NotFoundException('Membro não encontrado');
    }

    boardMember.role = updateMemberDto.role;
    return this.boardMemberRepository.save(boardMember);
  }

  async removeBoardMember(boardId: number, userId: number, memberUserId: number): Promise<void> {
    // Verificar permissões
    const board = await this.boardRepository.findOne({ where: { id: boardId } });
    if (!board) {
      throw new NotFoundException('Quadro não encontrado');
    }

    if (board.user_id !== userId) {
      const member = await this.boardMemberRepository.findOne({
        where: { board_id: boardId, user_id: userId, role: 'admin' }
      });
      if (!member) {
        throw new ForbiddenException('Sem permissão para remover membros');
      }
    }

    // Não permitir remover o proprietário
    if (board.user_id === memberUserId) {
      throw new ForbiddenException('Não é possível remover o proprietário do quadro');
    }

    await this.boardMemberRepository.delete({
      board_id: boardId,
      user_id: memberUserId
    });
  }
}
