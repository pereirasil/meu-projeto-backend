import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { SprintService } from '../services/sprint.service';
import { CreateSprintDto, UpdateSprintDto, CreateSprintTaskDto, UpdateSprintTaskDto } from '../dto/sprint.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('sprints')
@UseGuards(JwtAuthGuard)
export class SprintController {
  constructor(private readonly sprintService: SprintService) {}

  @Post()
  async createSprint(@Request() req, @Body() createSprintDto: CreateSprintDto) {
    return await this.sprintService.createSprint(req.user.sub, createSprintDto);
  }

  @Get('board/:boardId')
  async getSprintsByBoard(@Request() req, @Param('boardId') boardId: string) {
    return await this.sprintService.getSprintsByBoard(parseInt(boardId), req.user.sub);
  }

  @Get(':id')
  async getSprintById(@Request() req, @Param('id') id: string) {
    return await this.sprintService.getSprintById(parseInt(id), req.user.sub);
  }

  @Put(':id')
  async updateSprint(
    @Request() req,
    @Param('id') id: string,
    @Body() updateSprintDto: UpdateSprintDto
  ) {
    return await this.sprintService.updateSprint(parseInt(id), req.user.sub, updateSprintDto);
  }

  @Delete(':id')
  async deleteSprint(@Request() req, @Param('id') id: string) {
    await this.sprintService.deleteSprint(parseInt(id), req.user.sub);
    return { message: 'Sprint deletada com sucesso' };
  }

  @Get(':id/tasks')
  async getSprintTasks(@Request() req, @Param('id') id: string) {
    return await this.sprintService.getSprintTasks(parseInt(id), req.user.sub);
  }

  @Get(':id/columns')
  async getSprintColumns(@Request() req, @Param('id') id: string) {
    return await this.sprintService.getSprintColumns(parseInt(id), req.user.sub);
  }

  @Post(':id/columns')
  async createSprintColumn(@Request() req, @Param('id') id: string, @Body() createColumnDto: { nome: string }) {
    return await this.sprintService.createSprintColumn(parseInt(id), req.user.sub, createColumnDto);
  }

  @Put(':id/columns/:columnId')
  async updateSprintColumn(@Request() req, @Param('id') id: string, @Param('columnId') columnId: string, @Body() updateColumnDto: { nome: string }) {
    return await this.sprintService.updateSprintColumn(parseInt(id), parseInt(columnId), req.user.sub, updateColumnDto);
  }

  @Delete(':id/columns/:columnId')
  async deleteSprintColumn(@Request() req, @Param('id') id: string, @Param('columnId') columnId: string) {
    return await this.sprintService.deleteSprintColumn(parseInt(id), parseInt(columnId), req.user.sub);
  }

  @Post('tasks')
  @UseGuards() // Remover proteção temporariamente para teste
  async addTaskToSprint(@Request() req, @Body() createSprintTaskDto: CreateSprintTaskDto) {
    try {
      console.log('📝 Recebendo requisição para adicionar tarefa à sprint:', createSprintTaskDto);
      console.log('👤 User ID:', req.user?.sub || 'SEM_USUARIO');
      
      const result = await this.sprintService.addTaskToSprint(req.user?.sub || 1, createSprintTaskDto);
      console.log('✅ Tarefa adicionada com sucesso:', result);
      return result;
    } catch (error) {
      console.error('❌ Erro ao adicionar tarefa à sprint:', error);
      throw error;
    }
  }

  @Put('tasks/:taskId')
  async updateSprintTask(
    @Request() req,
    @Param('taskId') taskId: string,
    @Body() updateSprintTaskDto: UpdateSprintTaskDto
  ) {
    return await this.sprintService.updateSprintTask(parseInt(taskId), req.user.sub, updateSprintTaskDto);
  }

  @Delete('tasks/:taskId')
  async removeTaskFromSprint(@Request() req, @Param('taskId') taskId: string) {
    await this.sprintService.removeTaskFromSprint(parseInt(taskId), req.user.sub);
    return { message: 'Tarefa removida da sprint com sucesso' };
  }

  @Get('debug/tables')
  @UseGuards() // Remover proteção temporariamente para debug
  async debugTables() {
    try {
      // Verificar se as tabelas existem
      const sprintCount = await this.sprintService['sprintRepository'].count();
      const taskCount = await this.sprintService['sprintTaskRepository'].count();
      
      return {
        message: 'Debug das tabelas',
        sprintCount,
        taskCount,
        tablesExist: {
          sprints: sprintCount >= 0,
          sprint_tasks: taskCount >= 0
        }
      };
    } catch (error) {
      return {
        message: 'Erro ao verificar tabelas',
        error: error.message,
        stack: error.stack
      };
    }
  }

  @Post('debug/execute-sql')
  @UseGuards() // Remover proteção temporariamente para debug
  async executeSQL(@Body() body: { sql: string }) {
    try {
      const result = await this.sprintService['sprintRepository'].query(body.sql);
      return {
        message: 'SQL executado com sucesso',
        result
      };
    } catch (error) {
      return {
        message: 'Erro ao executar SQL',
        error: error.message,
        stack: error.stack
      };
    }
  }
}
