import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateListDto {
  @IsString()
  title: string;

  @IsNumber()
  board_id: number;

  @IsOptional()
  @IsNumber()
  position?: number;
}

export class UpdateListDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsNumber()
  position?: number;
}

export class MoveListDto {
  @IsNumber()
  position: number;
}
