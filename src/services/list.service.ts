import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { List } from '../entities/list.entity';
import { Board } from '../entities/board.entity';
import { BoardMember } from '../entities/board-member.entity';
import { CreateListDto, UpdateListDto, MoveListDto } from '../dto/list.dto';

@Injectable()
export class ListService {
  constructor(
    @InjectRepository(List)
    private listRepository: Repository<List>,
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
    @InjectRepository(BoardMember)
    private boardMemberRepository: Repository<BoardMember>,
  ) {}

  async createList(userId: number, createListDto: CreateListDto): Promise<List> {
    // Verificar se o usuário tem acesso ao quadro
    const board = await this.boardRepository.findOne({ where: { id: createListDto.board_id } });
    if (!board) {
      throw new NotFoundException('Quadro não encontrado');
    }

    if (board.user_id !== userId) {
      const member = await this.boardMemberRepository.findOne({
        where: { board_id: createListDto.board_id, user_id: userId }
      });
      if (!member) {
        throw new ForbiddenException('Sem permissão para criar listas neste quadro');
      }
    }

    // Determinar a posição da nova lista
    const lastList = await this.listRepository.findOne({
      where: { board_id: createListDto.board_id },
      order: { position: 'DESC' }
    });

    const position = lastList ? lastList.position + 1 : 0;

    const list = this.listRepository.create({
      ...createListDto,
      position,
    });

    return this.listRepository.save(list);
  }

  async updateList(listId: number, userId: number, updateListDto: UpdateListDto): Promise<List> {
    const list = await this.listRepository.findOne({
      where: { id: listId },
      relations: ['board']
    });

    if (!list) {
      throw new NotFoundException('Lista não encontrada');
    }

    // Verificar permissões
    if (list.board.user_id !== userId) {
      const member = await this.boardMemberRepository.findOne({
        where: { board_id: list.board_id, user_id: userId, role: 'admin' }
      });
      if (!member) {
        throw new ForbiddenException('Sem permissão para editar esta lista');
      }
    }

    Object.assign(list, updateListDto);
    return this.listRepository.save(list);
  }

  async deleteList(listId: number, userId: number): Promise<void> {
    const list = await this.listRepository.findOne({
      where: { id: listId },
      relations: ['board']
    });

    if (!list) {
      throw new NotFoundException('Lista não encontrada');
    }

    // Verificar permissões
    if (list.board.user_id !== userId) {
      const member = await this.boardMemberRepository.findOne({
        where: { board_id: list.board_id, user_id: userId, role: 'admin' }
      });
      if (!member) {
        throw new ForbiddenException('Sem permissão para deletar esta lista');
      }
    }

    await this.listRepository.remove(list);
  }

  async moveList(listId: number, userId: number, moveListDto: MoveListDto): Promise<List> {
    const list = await this.listRepository.findOne({
      where: { id: listId },
      relations: ['board']
    });

    if (!list) {
      throw new NotFoundException('Lista não encontrada');
    }

    // Verificar permissões
    if (list.board.user_id !== userId) {
      const member = await this.boardMemberRepository.findOne({
        where: { board_id: list.board_id, user_id: userId, role: 'admin' }
      });
      if (!member) {
        throw new ForbiddenException('Sem permissão para mover esta lista');
      }
    }

    const newPosition = moveListDto.position;

    // Se a posição não mudou, não fazer nada
    if (list.position === newPosition) {
      return list;
    }

    // Reordenar as listas
    if (list.position < newPosition) {
      // Movendo para baixo
      await this.listRepository
        .createQueryBuilder()
        .update(List)
        .set({ position: () => 'position - 1' })
        .where('board_id = :boardId', { boardId: list.board_id })
        .andWhere('position > :oldPosition', { oldPosition: list.position })
        .andWhere('position <= :newPosition', { newPosition })
        .execute();
    } else {
      // Movendo para cima
      await this.listRepository
        .createQueryBuilder()
        .update(List)
        .set({ position: () => 'position + 1' })
        .where('board_id = :boardId', { boardId: list.board_id })
        .andWhere('position >= :newPosition', { newPosition })
        .andWhere('position < :oldPosition', { oldPosition: list.position })
        .execute();
    }

    list.position = newPosition;
    return this.listRepository.save(list);
  }

  async getListsByBoard(boardId: number, userId: number): Promise<List[]> {
    // Verificar se o usuário tem acesso ao quadro
    const board = await this.boardRepository.findOne({ where: { id: boardId } });
    if (!board) {
      throw new NotFoundException('Quadro não encontrado');
    }

    if (board.user_id !== userId && !board.is_public) {
      const member = await this.boardMemberRepository.findOne({
        where: { board_id: boardId, user_id: userId }
      });
      if (!member) {
        throw new ForbiddenException('Sem permissão para acessar este quadro');
      }
    }

    return this.listRepository.find({
      where: { board_id: boardId },
      relations: ['cards'],
      order: { position: 'ASC' }
    });
  }
}
