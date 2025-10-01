import { IsString, IsOptional, IsBoolean, IsArray, IsNumber } from 'class-validator';

export class CreateBoardDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  is_public?: boolean;

  @IsOptional()
  @IsString()
  color?: string;
}

export class UpdateBoardDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  is_public?: boolean;

  @IsOptional()
  @IsString()
  color?: string;
}

export class AddBoardMemberDto {
  @IsNumber()
  user_id: number;

  @IsString()
  role: 'admin' | 'member';
}

export class UpdateBoardMemberDto {
  @IsString()
  role: 'admin' | 'member';
}
