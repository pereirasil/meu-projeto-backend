import { Controller, Post, Get, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { VotingService } from '../services/voting.service';
import { CreateVotingRoomDto } from '../dto/voting.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('voting')
@UseGuards(JwtAuthGuard)
export class VotingController {
  constructor(private readonly votingService: VotingService) {}

  @Post('rooms')
  async createRoom(@Request() req, @Body() createRoomDto: CreateVotingRoomDto) {
    return this.votingService.createRoom(createRoomDto, req.user.userId);
  }

  @Get('rooms')
  async getActiveRooms() {
    return this.votingService.getActiveRooms();
  }

  @Get('rooms/:roomId')
  async getRoom(@Param('roomId') roomId: string) {
    return this.votingService.getRoom(roomId);
  }

  @Delete('rooms/:roomId')
  async deactivateRoom(@Request() req, @Param('roomId') roomId: string) {
    await this.votingService.deactivateRoom(roomId, req.user.userId);
    return { message: 'Room deactivated successfully' };
  }

  @Get('rooms/:roomId/history')
  async getChatHistory(@Param('roomId') roomId: string) {
    return this.votingService.getChatHistory(roomId);
  }
}
