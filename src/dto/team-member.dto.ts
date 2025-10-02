import { IsString, IsEmail, IsEnum, IsOptional, IsInt, IsBoolean } from 'class-validator';
import { TeamRole } from '../entities/team-member.entity';
import { InviteStatus } from '../entities/team-invite.entity';

export class CreateTeamMemberDto {
  @IsInt()
  user_id: number;

  @IsInt()
  board_id: number;

  @IsOptional()
  @IsEnum(TeamRole)
  role?: TeamRole;

  @IsOptional()
  permissions?: any;
}

export class UpdateTeamMemberDto {
  @IsOptional()
  @IsEnum(TeamRole)
  role?: TeamRole;

  @IsOptional()
  permissions?: any;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class InviteTeamMemberDto {
  @IsEmail()
  email: string;

  @IsInt()
  board_id: number;

  @IsOptional()
  @IsEnum(TeamRole)
  role?: TeamRole;
}

export class AcceptInviteDto {
  @IsString()
  token: string;
}

export class UpdateInviteDto {
  @IsOptional()
  @IsEnum(InviteStatus)
  status?: InviteStatus;
}
