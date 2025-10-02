import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { CardService } from '../services/card.service';
import { CreateCardDto, UpdateCardDto, MoveCardDto, AssignCardDto } from '../dto/card.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('boards/:boardId/lists/:listId/cards')
@UseGuards(JwtAuthGuard)
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Get()
  async getCardsByList(@Request() req, @Param('listId') listId: string) {
    return this.cardService.getCardsByList(parseInt(listId), req.user.sub);
  }

  @Post()
  async createCard(@Request() req, @Param('listId') listId: string, @Body() createCardDto: CreateCardDto) {
    const cardData = { ...createCardDto, list_id: parseInt(listId) };
    return this.cardService.createCard(req.user.sub, cardData);
  }

  @Get(':cardId')
  async getCardById(@Request() req, @Param('cardId') cardId: string) {
    return this.cardService.getCardById(parseInt(cardId));
  }

  @Put(':cardId')
  async updateCard(
    @Request() req,
    @Param('listId') listId: string,
    @Param('cardId') cardId: string,
    @Body() updateCardDto: UpdateCardDto
  ) {
    return this.cardService.updateCard(parseInt(cardId), req.user.sub, updateCardDto);
  }

  @Delete(':cardId')
  async deleteCard(@Request() req, @Param('listId') listId: string, @Param('cardId') cardId: string) {
    return this.cardService.deleteCard(parseInt(cardId), req.user.sub);
  }

  @Put(':cardId/move')
  async moveCard(
    @Request() req,
    @Param('listId') listId: string,
    @Param('cardId') cardId: string,
    @Body() moveCardDto: MoveCardDto
  ) {
    return this.cardService.moveCard(parseInt(cardId), req.user.sub, moveCardDto);
  }

  @Put(':cardId/assign')
  async assignCard(
    @Request() req,
    @Param('listId') listId: string,
    @Param('cardId') cardId: string,
    @Body() assignCardDto: AssignCardDto
  ) {
    return this.cardService.assignCard(parseInt(cardId), req.user.sub, assignCardDto);
  }
}
