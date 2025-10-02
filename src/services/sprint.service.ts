import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sprint, SprintStatus } from '../entities/sprint.entity';
import { SprintTask, TaskStatus, TaskPriority } from '../entities/sprint-task.entity';
import { SprintColumn } from '../entities/sprint-column.entity';
import { SprintTaskCollaborator } from '../entities/sprint-task-collaborator.entity';
import { Board } from '../entities/board.entity';
import { List } from '../entities/list.entity';
import { Card } from '../entities/card.entity';
import { CreateSprintDto, UpdateSprintDto, CreateSprintTaskDto, UpdateSprintTaskDto } from '../dto/sprint.dto';

@Injectable()
export class SprintService {
  constructor(
    @InjectRepository(Sprint)
    private sprintRepository: Repository<Sprint>,
    @InjectRepository(SprintTask)
    private sprintTaskRepository: Repository<SprintTask>,
    @InjectRepository(SprintColumn)
    private sprintColumnRepository: Repository<SprintColumn>,
    @InjectRepository(SprintTaskCollaborator)
    private sprintTaskCollaboratorRepository: Repository<SprintTaskCollaborator>,
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
    @InjectRepository(List)
    private listRepository: Repository<List>,
    @InjectRepository(Card)
    private cardRepository: Repository<Card>,
  ) {}

  async createSprint(userId: number, createSprintDto: CreateSprintDto): Promise<Sprint> {
    const sprint = this.sprintRepository.create({
      ...createSprintDto,
      status: createSprintDto.status || SprintStatus.PLANNED,
    });

    return await this.sprintRepository.save(sprint);
  }

  async getSprintsByBoard(boardId: number, userId: number): Promise<Sprint[]> {
    return await this.sprintRepository.find({
      where: { board_id: boardId },
      order: { created_at: 'DESC' },
    });
  }

  async getSprintById(sprintId: number, userId: number): Promise<Sprint> {
    const sprint = await this.sprintRepository.findOne({
      where: { id: sprintId },
      relations: ['board'],
    });

    if (!sprint) {
      throw new NotFoundException('Sprint não encontrada');
    }

    return sprint;
  }

  async updateSprint(sprintId: number, userId: number, updateSprintDto: UpdateSprintDto): Promise<Sprint> {
    const sprint = await this.getSprintById(sprintId, userId);
    
    Object.assign(sprint, updateSprintDto);
    
    // Recalcular progresso se necessário
    if (updateSprintDto.status) {
      await this.calculateSprintProgress(sprintId);
    }

    return await this.sprintRepository.save(sprint);
  }

  async deleteSprint(sprintId: number, userId: number): Promise<void> {
    const sprint = await this.getSprintById(sprintId, userId);
    await this.sprintRepository.remove(sprint);
  }

  async getSprintTasks(sprintId: number, userId: number): Promise<SprintTask[]> {
    return await this.sprintTaskRepository.find({
      where: { sprint_id: sprintId },
      relations: ['column', 'sprint'],
      order: { created_at: 'ASC' },
    });
  }

  async getSprintColumns(sprintId: number, userId: number): Promise<SprintColumn[]> {
    return await this.sprintColumnRepository.find({
      where: { sprint_id: sprintId },
      order: { ordem: 'ASC' },
    });
  }

  async createSprintColumn(sprintId: number, userId: number, createColumnDto: { nome: string }): Promise<SprintColumn> {
    // Verificar se a sprint existe
    const sprint = await this.sprintRepository.findOne({
      where: { id: sprintId }
    });

    if (!sprint) {
      throw new NotFoundException('Sprint não encontrada');
    }

    // Obter a próxima ordem
    const lastColumn = await this.sprintColumnRepository.findOne({
      where: { sprint_id: sprintId },
      order: { ordem: 'DESC' }
    });

    const nextOrder = lastColumn ? lastColumn.ordem + 1 : 0;

    // Criar a nova coluna
    const newColumn = this.sprintColumnRepository.create({
      sprint_id: sprintId,
      nome: createColumnDto.nome,
      ordem: nextOrder
    });

    return await this.sprintColumnRepository.save(newColumn);
  }

  async updateSprintColumn(sprintId: number, columnId: number, userId: number, updateColumnDto: { nome: string }): Promise<SprintColumn> {
    // Verificar se a sprint existe
    const sprint = await this.sprintRepository.findOne({
      where: { id: sprintId }
    });

    if (!sprint) {
      throw new NotFoundException('Sprint não encontrada');
    }

    // Verificar se a coluna existe
    const column = await this.sprintColumnRepository.findOne({
      where: { id: columnId, sprint_id: sprintId }
    });

    if (!column) {
      throw new NotFoundException('Coluna não encontrada');
    }

    // Atualizar o nome da coluna
    column.nome = updateColumnDto.nome;

    return await this.sprintColumnRepository.save(column);
  }

  async deleteSprintColumn(sprintId: number, columnId: number, userId: number): Promise<void> {
    // Verificar se a sprint existe
    const sprint = await this.sprintRepository.findOne({
      where: { id: sprintId }
    });

    if (!sprint) {
      throw new NotFoundException('Sprint não encontrada');
    }

    // Verificar se a coluna existe
    const column = await this.sprintColumnRepository.findOne({
      where: { id: columnId, sprint_id: sprintId }
    });

    if (!column) {
      throw new NotFoundException('Coluna não encontrada');
    }

    // Buscar a primeira coluna para mover as tarefas
    const firstColumn = await this.sprintColumnRepository.findOne({
      where: { sprint_id: sprintId },
      order: { ordem: 'ASC' }
    });

    if (firstColumn && firstColumn.id !== columnId) {
      // Mover todas as tarefas da coluna para a primeira coluna
      await this.sprintTaskRepository.update(
        { column_id: columnId },
        { column_id: firstColumn.id }
      );
    }

    // Excluir a coluna
    await this.sprintColumnRepository.remove(column);
  }

  async addTaskToSprint(userId: number, createSprintTaskDto: CreateSprintTaskDto): Promise<SprintTask> {
    try {
      // Validar se a sprint existe
      const sprint = await this.sprintRepository.findOne({
        where: { id: createSprintTaskDto.sprint_id }
      });

      if (!sprint) {
        throw new NotFoundException('Sprint não encontrada');
      }

      // Buscar a primeira coluna da sprint (A Fazer)
      const firstColumn = await this.sprintColumnRepository.findOne({
        where: { 
          sprint_id: createSprintTaskDto.sprint_id,
          ordem: 0
        }
      });

      if (!firstColumn) {
        throw new BadRequestException('Sprint não possui colunas. Crie colunas primeiro.');
      }

      // Criar a tarefa diretamente na nova estrutura
      const sprintTask = this.sprintTaskRepository.create({
        sprint_id: createSprintTaskDto.sprint_id,
        titulo: createSprintTaskDto.titulo || createSprintTaskDto.title || 'Tarefa sem título',
        descricao: createSprintTaskDto.descricao || createSprintTaskDto.description || '',
        prioridade: createSprintTaskDto.prioridade || TaskPriority.MEDIUM,
        estimativa_horas: createSprintTaskDto.estimativa_horas || 0,
        data_limite: createSprintTaskDto.data_limite,
        column_id: firstColumn.id,
      });

      const savedTask = await this.sprintTaskRepository.save(sprintTask);
      
      // Recalcular estatísticas da sprint
      await this.calculateSprintProgress(createSprintTaskDto.sprint_id);

      return savedTask;
    } catch (error) {
      console.error('Erro ao adicionar tarefa à sprint:', error);
      throw error;
    }
  }

  async updateSprintTask(taskId: number, userId: number, updateSprintTaskDto: UpdateSprintTaskDto): Promise<SprintTask> {
    const sprintTask = await this.sprintTaskRepository.findOne({
      where: { id: taskId },
      relations: ['sprint'],
    });

    if (!sprintTask) {
      throw new NotFoundException('Tarefa da sprint não encontrada');
    }

    // Atualizar apenas os campos que existem na nova estrutura
    if (updateSprintTaskDto.titulo !== undefined) {
      sprintTask.titulo = updateSprintTaskDto.titulo;
    }
    if (updateSprintTaskDto.descricao !== undefined) {
      sprintTask.descricao = updateSprintTaskDto.descricao;
    }
    if (updateSprintTaskDto.prioridade !== undefined) {
      sprintTask.prioridade = updateSprintTaskDto.prioridade;
    }
    if (updateSprintTaskDto.data_limite !== undefined) {
      sprintTask.data_limite = updateSprintTaskDto.data_limite;
    }
    if (updateSprintTaskDto.estimativa_horas !== undefined) {
      sprintTask.estimativa_horas = updateSprintTaskDto.estimativa_horas;
    }
    if (updateSprintTaskDto.column_id !== undefined) {
      sprintTask.column_id = updateSprintTaskDto.column_id;
    }

    const savedTask = await this.sprintTaskRepository.save(sprintTask);

    // Recalcular estatísticas da sprint
    await this.calculateSprintProgress(sprintTask.sprint_id);

    return savedTask;
  }

  async removeTaskFromSprint(taskId: number, userId: number): Promise<void> {
    const sprintTask = await this.sprintTaskRepository.findOne({
      where: { id: taskId },
      relations: ['sprint'],
    });

    if (!sprintTask) {
      throw new NotFoundException('Tarefa da sprint não encontrada');
    }

    const sprintId = sprintTask.sprint_id;
    await this.sprintTaskRepository.remove(sprintTask);

    // Recalcular estatísticas da sprint
    await this.calculateSprintProgress(sprintId);
  }

  async getMyTasks(userId: number, year?: number, month?: number): Promise<SprintTask[]> {
    let query = this.sprintTaskRepository
      .createQueryBuilder('sprintTask')
      .leftJoinAndSelect('sprintTask.sprint', 'sprint')
      .leftJoinAndSelect('sprintTask.card', 'card')
      .where('sprintTask.assignee_id = :userId', { userId });

    if (year && month) {
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);
      
      query = query
        .andWhere('sprint.data_inicio >= :startDate', { startDate: startDate.toISOString().split('T')[0] })
        .andWhere('sprint.data_fim <= :endDate', { endDate: endDate.toISOString().split('T')[0] });
    }

    return await query
      .orderBy('sprint.data_inicio', 'DESC')
      .addOrderBy('sprintTask.created_at', 'ASC')
      .getMany();
  }

  private async calculateSprintProgress(sprintId: number): Promise<void> {
    const tasks = await this.sprintTaskRepository.find({
      where: { sprint_id: sprintId },
      relations: ['column']
    });

    const totalTasks = tasks.length;
    
    // Buscar colunas para determinar status
    const columns = await this.sprintColumnRepository.find({ 
      where: { sprint_id: sprintId },
      order: { ordem: 'ASC' }
    });

    const todoColumn = columns.find(c => c.ordem === 0);
    const inProgressColumn = columns.find(c => c.ordem === 1);
    const doneColumn = columns.find(c => c.ordem === 2);

    const completedTasks = doneColumn ? tasks.filter(task => task.column_id === doneColumn.id).length : 0;
    const inProgressTasks = inProgressColumn ? tasks.filter(task => task.column_id === inProgressColumn.id).length : 0;
    const pendingTasks = todoColumn ? tasks.filter(task => task.column_id === todoColumn.id).length : totalTasks - completedTasks - inProgressTasks;

    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    await this.sprintRepository.update(sprintId, {
      total_tasks: totalTasks,
      tasks_concluidas: completedTasks,
      tasks_em_andamento: inProgressTasks,
      tasks_pendentes: pendingTasks,
      progresso: Math.round(progress * 100) / 100,
    });
  }
}
