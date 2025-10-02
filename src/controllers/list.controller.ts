import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ListService } from '../services/list.service';
import { CreateListDto, UpdateListDto, MoveListDto } from '../dto/list.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('boards/:boardId/lists')
@UseGuards(JwtAuthGuard)
export class ListController {
  constructor(private readonly listService: ListService) {}

  @Get()
  async getListsByBoard(@Request() req, @Param('boardId') boardId: string) {
    return this.listService.getListsByBoard(parseInt(boardId), req.user.sub);
  }

  @Post()
  async createList(@Request() req, @Param('boardId') boardId: string, @Body() createListDto: CreateListDto) {
    const listData = { ...createListDto, board_id: parseInt(boardId) };
    return this.listService.createList(req.user.sub, listData);
  }

  @Put(':listId')
  async updateList(
    @Request() req,
    @Param('boardId') boardId: string,
    @Param('listId') listId: string,
    @Body() updateListDto: UpdateListDto
  ) {
    return this.listService.updateList(parseInt(listId), req.user.sub, updateListDto);
  }

  @Delete(':listId')
  async deleteList(@Request() req, @Param('boardId') boardId: string, @Param('listId') listId: string) {
    return this.listService.deleteList(parseInt(listId), req.user.sub);
  }

  @Put(':listId/move')
  async moveList(
    @Request() req,
    @Param('boardId') boardId: string,
    @Param('listId') listId: string,
    @Body() moveListDto: MoveListDto
  ) {
    return this.listService.moveList(parseInt(listId), req.user.sub, moveListDto);
  }
}
