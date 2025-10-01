import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { TeamService } from '../services/team.service';
import { InviteMemberDto, UpdateMemberDto } from '../dto/team.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('team')
@UseGuards(JwtAuthGuard)
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Get('members')
  async getTeamMembers(@Request() req) {
    return this.teamService.getTeamMembers(req.user.userId);
  }

  @Post('invite')
  async inviteMember(@Request() req, @Body() inviteMemberDto: InviteMemberDto) {
    return this.teamService.inviteMember(req.user.userId, inviteMemberDto);
  }

  @Put('members/:memberId')
  async updateMember(
    @Request() req,
    @Param('memberId') memberId: string,
    @Body() updateMemberDto: UpdateMemberDto
  ) {
    return this.teamService.updateMember(req.user.userId, parseInt(memberId), updateMemberDto);
  }

  @Delete('members/:memberId')
  async removeMember(@Request() req, @Param('memberId') memberId: string) {
    return this.teamService.removeMember(req.user.userId, parseInt(memberId));
  }
}
