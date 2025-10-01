import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { BoardService } from '../services/board.service';
import { CreateBoardDto, UpdateBoardDto, AddBoardMemberDto, UpdateBoardMemberDto } from '../dto/board.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('boards')
@UseGuards(JwtAuthGuard)
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Post()
  async createBoard(@Request() req, @Body() createBoardDto: CreateBoardDto) {
    return this.boardService.createBoard(req.user.userId, createBoardDto);
  }

  @Get()
  async getBoards(@Request() req) {
    return this.boardService.getBoards(req.user.userId);
  }

  @Get('user/:userId')
  async getUserBoards(@Request() req, @Param('userId') userId: string) {
    return this.boardService.getBoards(parseInt(userId));
  }

  @Get(':id')
  async getBoardById(@Request() req, @Param('id') id: string) {
    return this.boardService.getBoardById(parseInt(id), req.user.userId);
  }

  @Put(':id')
  async updateBoard(@Request() req, @Param('id') id: string, @Body() updateBoardDto: UpdateBoardDto) {
    return this.boardService.updateBoard(parseInt(id), req.user.userId, updateBoardDto);
  }

  @Delete(':id')
  async deleteBoard(@Request() req, @Param('id') id: string) {
    return this.boardService.deleteBoard(parseInt(id), req.user.userId);
  }

  @Post(':id/members')
  async addBoardMember(@Request() req, @Param('id') id: string, @Body() addMemberDto: AddBoardMemberDto) {
    return this.boardService.addBoardMember(parseInt(id), req.user.userId, addMemberDto);
  }

  @Put(':id/members/:memberId')
  async updateBoardMember(
    @Request() req,
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Body() updateMemberDto: UpdateBoardMemberDto
  ) {
    return this.boardService.updateBoardMember(parseInt(id), req.user.userId, parseInt(memberId), updateMemberDto);
  }

  @Delete(':id/members/:memberId')
  async removeBoardMember(@Request() req, @Param('id') id: string, @Param('memberId') memberId: string) {
    return this.boardService.removeBoardMember(parseInt(id), req.user.userId, parseInt(memberId));
  }
}
