import { IsEmail, IsString, IsOptional, IsNumber, IsIn } from 'class-validator';

export class InviteMemberDto {
  @IsEmail()
  email: string;

  @IsNumber()
  board_id: number;

  @IsOptional()
  @IsString()
  @IsIn(['owner', 'admin', 'member'])
  role?: string = 'member';
}

export class UpdateMemberDto {
  @IsNumber()
  board_id: number;

  @IsString()
  @IsIn(['owner', 'admin', 'member'])
  role: string;
}
