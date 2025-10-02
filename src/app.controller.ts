import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation, ApiResponse, ApiProperty } from '@nestjs/swagger';

// DTO para exemplo
class CreateItemDto {
  @ApiProperty({
    description: 'Nome único que identifica o produto no sistema',
    example: 'Smartphone Galaxy S21',
    required: true
  })
  name: string;

  @ApiProperty({
    description: 'Descrição completa do produto incluindo características, especificações e diferenciais',
    example: 'Smartphone Samsung Galaxy S21 com 128GB, 8GB RAM, Tela 6.2" Dynamic AMOLED 2X, Câmera Tripla 64MP',
    required: true
  })
  description: string;
}

@ApiTags('Gerenciamento de Produtos')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Página inicial da API',
    description: 'Endpoint que retorna uma mensagem de boas-vindas para verificar se a API está funcionando corretamente'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'API está online e funcionando corretamente',
    schema: {
      example: 'Bem-vindo à API de Gerenciamento de Produtos'
    }
  })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('items')
  @ApiOperation({ 
    summary: 'Listar todos os produtos',
    description: 'Retorna uma lista completa de todos os produtos cadastrados no sistema, incluindo seus identificadores e informações básicas'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de produtos recuperada com sucesso',
    schema: {
      example: ['Smartphone Galaxy S21', 'MacBook Pro M1', 'PlayStation 5']
    }
  })
  getItems(): string[] {
    return ['Item 1', 'Item 2', 'Item 3'];
  }

  @Get('items/:id')
  @ApiOperation({ 
    summary: 'Buscar produto por ID',
    description: 'Recupera as informações detalhadas de um produto específico usando seu identificador único (ID)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Produto encontrado e retornado com sucesso',
    schema: {
      example: {
        id: '1',
        name: 'Smartphone Galaxy S21',
        description: 'Smartphone Samsung Galaxy S21 com 128GB'
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Produto não encontrado - O ID fornecido não corresponde a nenhum produto cadastrado'
  })
  getItemById(@Param('id') id: string): string {
    return `Item ${id}`;
  }

  @Post('items')
  @ApiOperation({ 
    summary: 'Cadastrar novo produto',
    description: 'Cria um novo registro de produto no sistema com as informações fornecidas no corpo da requisição'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Produto cadastrado com sucesso',
    schema: {
      example: {
        message: 'Produto cadastrado com sucesso',
        product: {
          name: 'Smartphone Galaxy S21',
          description: 'Smartphone Samsung Galaxy S21 com 128GB'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Dados inválidos - Verifique se todos os campos obrigatórios foram preenchidos corretamente'
  })
  createItem(@Body() createItemDto: CreateItemDto): string {
    return `Produto cadastrado com sucesso: ${createItemDto.name}`;
  }

  @Get('debug/sprint-tables')
  async debugSprintTables() {
    try {
      // Este endpoint será implementado para verificar as tabelas
      return {
        message: 'Endpoint de debug das tabelas de sprint',
        status: 'implementando...'
      };
    } catch (error) {
      return {
        message: 'Erro ao verificar tabelas',
        error: error.message
      };
    }
  }

  @Post('debug/test-sprint-task')
  async testSprintTask(@Body() body: any) {
    try {
      // Simular a criação de uma tarefa de sprint
      return {
        message: 'Teste de criação de tarefa de sprint',
        data: body,
        status: 'sucesso'
      };
    } catch (error) {
      return {
        message: 'Erro no teste',
        error: error.message
      };
    }
  }
}
