import { IsString, IsNumber, IsOptional, IsDateString, IsArray, IsEnum } from 'class-validator';

export class CreateCardDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  list_id: number;

  @IsOptional()
  @IsNumber()
  position?: number;

  @IsOptional()
  @IsDateString()
  due_date?: string;

  @IsOptional()
  @IsEnum(['low', 'medium', 'high'])
  priority?: 'low' | 'medium' | 'high';

  @IsOptional()
  @IsNumber()
  assigned_user_id?: number;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  label_ids?: number[];
}

export class UpdateCardDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  due_date?: string;

  @IsOptional()
  @IsEnum(['low', 'medium', 'high'])
  priority?: 'low' | 'medium' | 'high';

  @IsOptional()
  @IsNumber()
  assigned_user_id?: number;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  label_ids?: number[];
}

export class MoveCardDto {
  @IsNumber()
  list_id: number;

  @IsNumber()
  position: number;
}

export class AssignCardDto {
  @IsNumber()
  user_id: number;
}
