import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Card } from '../entities/card.entity';
import { List } from '../entities/list.entity';
import { Board } from '../entities/board.entity';
import { BoardMember } from '../entities/board-member.entity';
import { Label } from '../entities/label.entity';
import { CreateCardDto, UpdateCardDto, MoveCardDto, AssignCardDto } from '../dto/card.dto';

@Injectable()
export class CardService {
  constructor(
    @InjectRepository(Card)
    private cardRepository: Repository<Card>,
    @InjectRepository(List)
    private listRepository: Repository<List>,
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
    @InjectRepository(BoardMember)
    private boardMemberRepository: Repository<BoardMember>,
    @InjectRepository(Label)
    private labelRepository: Repository<Label>,
  ) {}

  async createCard(userId: number, createCardDto: CreateCardDto): Promise<Card> {
    // Verificar se o usuário tem acesso à lista
    const list = await this.listRepository.findOne({
      where: { id: createCardDto.list_id },
      relations: ['board']
    });

    if (!list) {
      throw new NotFoundException('Lista não encontrada');
    }

    if (list.board.user_id !== userId) {
      const member = await this.boardMemberRepository.findOne({
        where: { board_id: list.board_id, user_id: userId }
      });
      if (!member) {
        throw new ForbiddenException('Sem permissão para criar cartões nesta lista');
      }
    }

    // Determinar a posição do novo cartão
    const lastCard = await this.cardRepository.findOne({
      where: { list_id: createCardDto.list_id },
      order: { position: 'DESC' }
    });

    const position = lastCard ? lastCard.position + 1 : 0;

    const card = this.cardRepository.create({
      ...createCardDto,
      position,
    });

    const savedCard = await this.cardRepository.save(card);

    // Adicionar etiquetas se especificadas
    if (createCardDto.label_ids && createCardDto.label_ids.length > 0) {
      await this.addLabelsToCard(savedCard.id, createCardDto.label_ids);
    }

    return this.getCardById(savedCard.id);
  }

  async updateCard(cardId: number, userId: number, updateCardDto: UpdateCardDto): Promise<Card> {
    const card = await this.cardRepository.findOne({
      where: { id: cardId },
      relations: ['list', 'list.board']
    });

    if (!card) {
      throw new NotFoundException('Cartão não encontrado');
    }

    // Verificar permissões
    if (card.list.board.user_id !== userId) {
      const member = await this.boardMemberRepository.findOne({
        where: { board_id: card.list.board_id, user_id: userId, role: 'admin' }
      });
      if (!member) {
        throw new ForbiddenException('Sem permissão para editar este cartão');
      }
    }

    Object.assign(card, updateCardDto);

    // Atualizar etiquetas se especificadas
    if (updateCardDto.label_ids !== undefined) {
      await this.updateCardLabels(cardId, updateCardDto.label_ids);
    }

    const updatedCard = await this.cardRepository.save(card);
    return this.getCardById(updatedCard.id);
  }

  async deleteCard(cardId: number, userId: number): Promise<void> {
    const card = await this.cardRepository.findOne({
      where: { id: cardId },
      relations: ['list', 'list.board']
    });

    if (!card) {
      throw new NotFoundException('Cartão não encontrado');
    }

    // Verificar permissões
    if (card.list.board.user_id !== userId) {
      const member = await this.boardMemberRepository.findOne({
        where: { board_id: card.list.board_id, user_id: userId, role: 'admin' }
      });
      if (!member) {
        throw new ForbiddenException('Sem permissão para deletar este cartão');
      }
    }

    await this.cardRepository.remove(card);
  }

  async moveCard(cardId: number, userId: number, moveCardDto: MoveCardDto): Promise<Card> {
    const card = await this.cardRepository.findOne({
      where: { id: cardId },
      relations: ['list', 'list.board']
    });

    if (!card) {
      throw new NotFoundException('Cartão não encontrado');
    }

    // Verificar permissões
    if (card.list.board.user_id !== userId) {
      const member = await this.boardMemberRepository.findOne({
        where: { board_id: card.list.board_id, user_id: userId, role: 'admin' }
      });
      if (!member) {
        throw new ForbiddenException('Sem permissão para mover este cartão');
      }
    }

    const newListId = moveCardDto.list_id;
    const newPosition = moveCardDto.position;

    // Se a lista e posição não mudaram, não fazer nada
    if (card.list_id === newListId && card.position === newPosition) {
      return card;
    }

    // Reordenar cartões na lista de origem (se mudou de lista)
    if (card.list_id !== newListId) {
      await this.cardRepository
        .createQueryBuilder()
        .update(Card)
        .set({ position: () => 'position - 1' })
        .where('list_id = :oldListId', { oldListId: card.list_id })
        .andWhere('position > :oldPosition', { oldPosition: card.position })
        .execute();
    }

    // Reordenar cartões na lista de destino
    if (newPosition > 0) {
      await this.cardRepository
        .createQueryBuilder()
        .update(Card)
        .set({ position: () => 'position + 1' })
        .where('list_id = :newListId', { newListId })
        .andWhere('position >= :newPosition', { newPosition })
        .execute();
    }

    card.list_id = newListId;
    card.position = newPosition;

    const movedCard = await this.cardRepository.save(card);
    return this.getCardById(movedCard.id);
  }

  async assignCard(cardId: number, userId: number, assignCardDto: AssignCardDto): Promise<Card> {
    const card = await this.cardRepository.findOne({
      where: { id: cardId },
      relations: ['list', 'list.board']
    });

    if (!card) {
      throw new NotFoundException('Cartão não encontrado');
    }

    // Verificar permissões
    if (card.list.board.user_id !== userId) {
      const member = await this.boardMemberRepository.findOne({
        where: { board_id: card.list.board_id, user_id: userId, role: 'admin' }
      });
      if (!member) {
        throw new ForbiddenException('Sem permissão para atribuir este cartão');
      }
    }

    card.assigned_user_id = assignCardDto.user_id;
    const updatedCard = await this.cardRepository.save(card);
    return this.getCardById(updatedCard.id);
  }

  async getCardById(cardId: number): Promise<Card> {
    return this.cardRepository.findOne({
      where: { id: cardId },
      relations: [
        'list',
        'list.board',
        'assigned_user',
        'labels',
        'checklists',
        'checklists.items',
        'comments',
        'comments.user'
      ]
    });
  }

  async getCardsByList(listId: number, userId: number): Promise<Card[]> {
    // Verificar se o usuário tem acesso à lista
    const list = await this.listRepository.findOne({
      where: { id: listId },
      relations: ['board']
    });

    if (!list) {
      throw new NotFoundException('Lista não encontrada');
    }

    if (list.board.user_id !== userId && !list.board.is_public) {
      const member = await this.boardMemberRepository.findOne({
        where: { board_id: list.board_id, user_id: userId }
      });
      if (!member) {
        throw new ForbiddenException('Sem permissão para acessar esta lista');
      }
    }

    return this.cardRepository.find({
      where: { list_id: listId },
      relations: [
        'assigned_user',
        'labels',
        'checklists',
        'checklists.items',
        'comments',
        'comments.user'
      ],
      order: { position: 'ASC' }
    });
  }

  private async addLabelsToCard(cardId: number, labelIds: number[]): Promise<void> {
    const card = await this.cardRepository.findOne({
      where: { id: cardId },
      relations: ['labels']
    });

    const labels = await this.labelRepository.findByIds(labelIds);
    card.labels = [...card.labels, ...labels];
    await this.cardRepository.save(card);
  }

  private async updateCardLabels(cardId: number, labelIds: number[]): Promise<void> {
    const card = await this.cardRepository.findOne({
      where: { id: cardId },
      relations: ['labels']
    });

    const labels = await this.labelRepository.findByIds(labelIds);
    card.labels = labels;
    await this.cardRepository.save(card);
  }
}
