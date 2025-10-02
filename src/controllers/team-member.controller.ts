import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { TeamMemberService } from '../services/team-member.service';
import { CreateTeamMemberDto, UpdateTeamMemberDto, InviteTeamMemberDto, AcceptInviteDto, UpdateInviteDto } from '../dto/team-member.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('team-members')
@UseGuards(JwtAuthGuard)
export class TeamMemberController {
  constructor(private readonly teamMemberService: TeamMemberService) {}

  @Get('board/:boardId')
  async getBoardMembers(@Request() req, @Param('boardId') boardId: string) {
    return await this.teamMemberService.getBoardMembers(parseInt(boardId), req.user.userId);
  }

  @Post()
  async addMemberToBoard(@Request() req, @Body() createTeamMemberDto: CreateTeamMemberDto) {
    return await this.teamMemberService.addMemberToBoard(req.user.userId, createTeamMemberDto);
  }

  @Put(':id')
  async updateMemberRole(
    @Request() req,
    @Param('id') id: string,
    @Body() updateTeamMemberDto: UpdateTeamMemberDto
  ) {
    return await this.teamMemberService.updateMemberRole(parseInt(id), req.user.userId, updateTeamMemberDto);
  }

  @Delete(':id')
  async removeMemberFromBoard(@Request() req, @Param('id') id: string) {
    await this.teamMemberService.removeMemberFromBoard(parseInt(id), req.user.userId);
    return { message: 'Membro removido com sucesso' };
  }

  @Post('invite')
  async inviteMemberToBoard(@Request() req, @Body() inviteTeamMemberDto: InviteTeamMemberDto) {
    return await this.teamMemberService.inviteMemberToBoard(req.user.userId, inviteTeamMemberDto);
  }

  @Get('invites/board/:boardId')
  async getBoardInvites(@Request() req, @Param('boardId') boardId: string) {
    return await this.teamMemberService.getBoardInvites(parseInt(boardId), req.user.userId);
  }

  @Post('accept-invite')
  async acceptInvite(@Request() req, @Body() acceptInviteDto: AcceptInviteDto) {
    return await this.teamMemberService.acceptInvite(req.user.userId, acceptInviteDto);
  }

  @Put('invites/:inviteId')
  async updateInviteStatus(
    @Request() req,
    @Param('inviteId') inviteId: string,
    @Body() updateInviteDto: UpdateInviteDto
  ) {
    return await this.teamMemberService.updateInviteStatus(parseInt(inviteId), req.user.userId, updateInviteDto);
  }

  @Delete('invites/:inviteId')
  async deleteInvite(@Request() req, @Param('inviteId') inviteId: string) {
    await this.teamMemberService.deleteInvite(parseInt(inviteId), req.user.userId);
    return { message: 'Convite deletado com sucesso' };
  }
}
