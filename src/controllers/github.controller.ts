import { Controller, Post, Get, Delete, Body, Query, UseGuards, Req, Logger, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { GitHubService } from '../services/github.service';
import { Response } from 'express';

@ApiTags('GitHub Integration')
@Controller('github')
@ApiBearerAuth()
export class GitHubController {
  private readonly logger = new Logger(GitHubController.name);

  constructor(private readonly githubService: GitHubService) {}

  @Post('auth-url')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Gera URL de autorização do GitHub' })
  @ApiResponse({ status: 200, description: 'URL de autorização gerada com sucesso' })
  generateAuthUrl(@Body() body: { redirectUri: string }, @Req() req: any) {
    try {
      const userId = req.user.sub;
      const state = `user_${userId}_${Date.now()}`;
      
      const authUrl = this.githubService.generateAuthUrl(state, body.redirectUri);
      
      this.logger.log(`URL de autorização GitHub gerada para usuário ${userId}`);
      
      return {
        success: true,
        authUrl,
        state,
      };
    } catch (error) {
      this.logger.error('Erro ao gerar URL de autorização do GitHub:', error.message);
      throw error;
    }
  }

  @Get('callback')
  @ApiOperation({ summary: 'Callback GET do GitHub OAuth (chamado pelo GitHub)' })
  @ApiResponse({ status: 200, description: 'Callback processado e redirecionado para o frontend' })
  async handleCallbackGet(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('redirect_uri') redirectUri: string,
    @Res() res: Response
  ) {
    try {
      this.logger.log(`Processando callback GET do GitHub com código: ${code ? 'presente' : 'ausente'}`);

      if (!code) {
        this.logger.error('Código de autorização não fornecido pelo GitHub');
        return res.redirect(`http://localhost:5000/settings?error=no_code&message=Authorization code not provided`);
      }

      if (!state) {
        this.logger.error('State não fornecido pelo GitHub');
        return res.redirect(`http://localhost:5000/settings?error=no_state&message=State parameter not provided`);
      }

      // Extrair userId do state
      const stateParts = state.split('_');
      if (stateParts.length < 3 || stateParts[0] !== 'user') {
        this.logger.error('State inválido:', state);
        return res.redirect(`http://localhost:5000/settings?error=invalid_state&message=Invalid state parameter`);
      }

      const userId = stateParts[1];

      // Trocar código por token
      const tokenResponse = await this.githubService.exchangeCodeForToken(code, redirectUri);

      // Obter informações do usuário
      const userInfo = await this.githubService.getUserInfo(tokenResponse.access_token);
      const userEmails = await this.githubService.getUserEmails(tokenResponse.access_token);

      // Encontrar email primário
      const primaryEmail = userEmails.find(email => email.primary)?.email || userInfo.email;

      this.logger.log(`GitHub conectado com sucesso para usuário ${userId}: ${userInfo.login}`);

      // Preparar dados para o frontend
      const githubData = {
        success: true,
        user: {
          id: userInfo.id,
          login: userInfo.login,
          name: userInfo.name,
          email: primaryEmail,
          avatar_url: userInfo.avatar_url,
          html_url: userInfo.html_url,
        },
        access_token: tokenResponse.access_token,
        scope: tokenResponse.scope,
      };

      // Redirecionar para o frontend com os dados
      const frontendUrl = `http://localhost:5000/settings?success=true&github_data=${encodeURIComponent(JSON.stringify(githubData))}`;
      return res.redirect(frontendUrl);

    } catch (error) {
      this.logger.error('Erro ao processar callback GET do GitHub:', error.message);
      const frontendUrl = `http://localhost:5000/settings?error=oauth_error&message=${encodeURIComponent(error.message)}`;
      return res.redirect(frontendUrl);
    }
  }

  @Post('callback')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Processa callback do GitHub OAuth (POST version)' })
  @ApiResponse({ status: 200, description: 'Callback processado com sucesso' })
  async handleCallback(
    @Body() body: { code: string; redirectUri: string; state: string },
    @Req() req: any
  ) {
    try {
      const userId = req.user.sub;
      this.logger.log(`Processando callback GitHub para usuário ${userId}`);

      // Validar state
      if (!body.state.startsWith(`user_${userId}_`)) {
        throw new Error('Estado inválido');
      }

      // Trocar código por token
      const tokenResponse = await this.githubService.exchangeCodeForToken(
        body.code,
        body.redirectUri
      );

      // Obter informações do usuário
      const userInfo = await this.githubService.getUserInfo(tokenResponse.access_token);
      const userEmails = await this.githubService.getUserEmails(tokenResponse.access_token);

      // Encontrar email primário
      const primaryEmail = userEmails.find(email => email.primary)?.email || userInfo.email;

      this.logger.log(`GitHub conectado com sucesso para usuário ${userId}: ${userInfo.login}`);

      return {
        success: true,
        user: {
          id: userInfo.id,
          login: userInfo.login,
          name: userInfo.name,
          email: primaryEmail,
          avatar_url: userInfo.avatar_url,
          html_url: userInfo.html_url,
        },
        access_token: tokenResponse.access_token,
        scope: tokenResponse.scope,
      };
    } catch (error) {
      this.logger.error('Erro ao processar callback do GitHub:', error.message);
      throw error;
    }
  }

  @Get('user')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtém informações do usuário GitHub conectado' })
  @ApiResponse({ status: 200, description: 'Informações do usuário obtidas com sucesso' })
  async getUserInfo(@Query('access_token') accessToken: string) {
    try {
      this.logger.log('Obtendo informações do usuário GitHub...');

      const userInfo = await this.githubService.getUserInfo(accessToken);
      const userEmails = await this.githubService.getUserEmails(accessToken);

      return {
        success: true,
        user: {
          ...userInfo,
          emails: userEmails,
        },
      };
    } catch (error) {
      this.logger.error('Erro ao obter informações do usuário GitHub:', error.message);
      throw error;
    }
  }

  @Get('repositories')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtém repositórios do usuário GitHub' })
  @ApiResponse({ status: 200, description: 'Repositórios obtidos com sucesso' })
  async getUserRepositories(
    @Query('access_token') accessToken: string,
    @Query('username') username: string
  ) {
    try {
      this.logger.log(`Obtendo repositórios do usuário GitHub: ${username}`);

      const repositories = await this.githubService.getUserRepositories(accessToken, username);

      return {
        success: true,
        repositories: repositories.map(repo => ({
          id: repo.id,
          name: repo.name,
          full_name: repo.full_name,
          description: repo.description,
          html_url: repo.html_url,
          clone_url: repo.clone_url,
          language: repo.language,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          updated_at: repo.updated_at,
          private: repo.private,
        })),
      };
    } catch (error) {
      this.logger.error('Erro ao obter repositórios do usuário GitHub:', error.message);
      throw error;
    }
  }

  @Post('webhook')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Cria webhook para um repositório GitHub' })
  @ApiResponse({ status: 200, description: 'Webhook criado com sucesso' })
  async createWebhook(
    @Body() body: {
      access_token: string;
      owner: string;
      repo: string;
      webhook_url: string;
      events?: string[];
    }
  ) {
    try {
      this.logger.log(`Criando webhook para ${body.owner}/${body.repo}`);

      const webhook = await this.githubService.createWebhook(
        body.access_token,
        body.owner,
        body.repo,
        body.webhook_url,
        body.events || ['push', 'pull_request']
      );

      return {
        success: true,
        webhook: {
          id: webhook.id,
          name: webhook.name,
          active: webhook.active,
          events: webhook.events,
          config: webhook.config,
          created_at: webhook.created_at,
        },
      };
    } catch (error) {
      this.logger.error('Erro ao criar webhook do GitHub:', error.message);
      throw error;
    }
  }

  @Get('debug')
  @ApiOperation({ summary: 'Debug informações do GitHub OAuth' })
  @ApiResponse({ status: 200, description: 'Informações de debug' })
  debugInfo() {
    try {
      const clientId = this.githubService['clientId'];
      const clientSecret = this.githubService['clientSecret'];
      
      return {
        success: true,
        debug: {
          clientId: clientId,
          clientSecretMasked: clientSecret ? `${clientSecret.substring(0, 4)}****` : 'not-set',
          hasClientId: !!clientId,
          hasClientSecret: !!clientSecret,
          clientIdLength: clientId ? clientId.length : 0,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      this.logger.error('Erro ao obter informações de debug:', error.message);
      throw error;
    }
  }

  @Get('env-check')
  @ApiOperation({ summary: 'Verificar variáveis de ambiente (público)' })
  @ApiResponse({ status: 200, description: 'Status das variáveis de ambiente' })
  envCheck() {
    try {
      const clientId = this.githubService['clientId'];
      const clientSecret = this.githubService['clientSecret'];
      const nodeEnv = process.env.NODE_ENV || 'development';
      
      return {
        success: true,
        environment: nodeEnv,
        github: {
          hasClientId: !!clientId,
          hasClientSecret: !!clientSecret,
          clientIdMasked: clientId ? `${clientId.substring(0, 4)}****` : 'not-set',
          clientSecretMasked: clientSecret ? `${clientSecret.substring(0, 4)}****` : 'not-set'
        },
        timestamp: new Date().toISOString(),
        server: 'running'
      };
    } catch (error) {
      this.logger.error('Erro ao verificar variáveis de ambiente:', error.message);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Verifica status da conexão GitHub' })
  @ApiResponse({ status: 200, description: 'Status da conexão verificado' })
  async getConnectionStatus(@Req() req: any) {
    try {
      const userId = req.user.sub;
      this.logger.log(`Verificando status da conexão GitHub para usuário ${userId}`);

      // Em uma implementação real, você buscaria o token do banco de dados
      // Por enquanto, retornamos um status mock
      return {
        success: true,
        connected: false,
        message: 'GitHub não conectado',
        user: null
      };
    } catch (error) {
      this.logger.error('Erro ao verificar status da conexão GitHub:', error.message);
      throw error;
    }
  }

  @Post('validate-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Valida token de acesso do GitHub' })
  @ApiResponse({ status: 200, description: 'Token validado com sucesso' })
  async validateToken(@Body() body: { access_token: string }) {
    try {
      this.logger.log('Validando token do GitHub...');

      const isValid = await this.githubService.validateToken(body.access_token);

      return {
        success: true,
        valid: isValid,
      };
    } catch (error) {
      this.logger.error('Erro ao validar token do GitHub:', error.message);
      throw error;
    }
  }

  @Delete('disconnect')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Desconecta integração com GitHub' })
  @ApiResponse({ status: 200, description: 'Integração desconectada com sucesso' })
  async disconnect(@Req() req: any) {
    try {
      const userId = req.user.sub;
      this.logger.log(`Desconectando GitHub para usuário ${userId}`);

      // Em uma implementação real, você removeria o token do banco de dados
      // Por enquanto, apenas logamos a ação

      return {
        success: true,
        message: 'GitHub desconectado com sucesso',
      };
    } catch (error) {
      this.logger.error('Erro ao desconectar GitHub:', error.message);
      throw error;
    }
  }
}
