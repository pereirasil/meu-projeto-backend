import { IsString, IsDateString, IsEnum, IsOptional, IsInt, Min, Max } from 'class-validator';
import { SprintStatus } from '../entities/sprint.entity';
import { TaskStatus, TaskPriority } from '../entities/sprint-task.entity';

export class CreateSprintDto {
  @IsString()
  nome: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsDateString()
  data_inicio: string;

  @IsDateString()
  data_fim: string;

  @IsOptional()
  @IsEnum(SprintStatus)
  status?: SprintStatus;

  @IsInt()
  board_id: number;
}

export class UpdateSprintDto {
  @IsOptional()
  @IsString()
  nome?: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsDateString()
  data_inicio?: string;

  @IsOptional()
  @IsDateString()
  data_fim?: string;

  @IsOptional()
  @IsEnum(SprintStatus)
  status?: SprintStatus;
}

export class CreateSprintTaskDto {
  @IsInt()
  sprint_id: number;

  @IsString()
  titulo: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsEnum(TaskPriority)
  prioridade?: TaskPriority;

  @IsOptional()
  @IsDateString()
  data_limite?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(999)
  estimativa_horas?: number;

  // Campos legados para compatibilidade
  @IsOptional()
  @IsInt()
  card_id?: number;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsInt()
  assignee_id?: number;

  @IsOptional()
  @IsString()
  observacoes?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  board_id?: number;

  @IsOptional()
  @IsInt()
  list_id?: number;
}

export class UpdateSprintTaskDto {
  @IsOptional()
  @IsString()
  titulo?: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsEnum(TaskPriority)
  prioridade?: TaskPriority;

  @IsOptional()
  @IsDateString()
  data_limite?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(999)
  estimativa_horas?: number;

  @IsOptional()
  @IsInt()
  column_id?: number;

  // Campos legados para compatibilidade
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsInt()
  assignee_id?: number;

  @IsOptional()
  @IsString()
  observacoes?: string;
}
