import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface GitHubUser {
  id: number;
  login: string;
  name: string;
  email: string;
  avatar_url: string;
  html_url: string;
}

export interface GitHubTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
}

@Injectable()
export class GitHubService {
  private readonly logger = new Logger(GitHubService.name);
  private readonly clientId: string;
  private readonly clientSecret: string;

  constructor(private configService: ConfigService) {
    this.clientId = this.configService.get<string>('GITHUB_CLIENT_ID') || 'Ov23lizvhhJM3ueDoymL';
    this.clientSecret = this.configService.get<string>('GITHUB_CLIENT_SECRET') || '81cdef78ba4592c5bb11836997c92163c8305005';
    
    this.logger.log(`🔧 GitHub OAuth configurado - Client ID: ${this.clientId}`);
    
    // Verificar se as credenciais são válidas (não são valores padrão de exemplo)
    if (!this.clientId || this.clientId === 'your-github-client-id' || this.clientId === 'example-client-id') {
      this.logger.warn('⚠️  GITHUB_CLIENT_ID não configurado! Use as credenciais reais da sua OAuth App.');
    }
    if (!this.clientSecret || this.clientSecret === 'your-github-client-secret' || this.clientSecret === 'example-client-secret') {
      this.logger.warn('⚠️  GITHUB_CLIENT_SECRET não configurado! Use as credenciais reais da sua OAuth App.');
    }
  }

  /**
   * Gera URL de autorização do GitHub OAuth
   */
  generateAuthUrl(state: string, redirectUri: string): string {
    const scope = 'user:email,repo';
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: redirectUri,
      scope,
      state,
    });

    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  /**
   * Troca código de autorização por token de acesso
   */
  async exchangeCodeForToken(code: string, redirectUri: string): Promise<GitHubTokenResponse> {
    try {
      this.logger.log(`Trocando código por token do GitHub: ${code.substring(0, 10)}...`);

      const response = await axios.post('https://github.com/login/oauth/access_token', {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
        redirect_uri: redirectUri,
      }, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (response.data.error) {
        throw new Error(`GitHub OAuth error: ${response.data.error_description}`);
      }

      this.logger.log('Token do GitHub obtido com sucesso');
      return response.data;
    } catch (error) {
      this.logger.error('Erro ao trocar código por token do GitHub:', error.message);
      throw error;
    }
  }

  /**
   * Obtém informações do usuário GitHub usando o token de acesso
   */
  async getUserInfo(accessToken: string): Promise<GitHubUser> {
    try {
      this.logger.log('Obtendo informações do usuário GitHub...');

      const response = await axios.get('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      this.logger.log(`Usuário GitHub obtido: ${response.data.login}`);
      return response.data;
    } catch (error) {
      this.logger.error('Erro ao obter informações do usuário GitHub:', error.message);
      throw error;
    }
  }

  /**
   * Obtém emails do usuário GitHub
   */
  async getUserEmails(accessToken: string): Promise<any[]> {
    try {
      this.logger.log('Obtendo emails do usuário GitHub...');

      const response = await axios.get('https://api.github.com/user/emails', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      return response.data;
    } catch (error) {
      this.logger.error('Erro ao obter emails do usuário GitHub:', error.message);
      throw error;
    }
  }

  /**
   * Obtém repositórios do usuário GitHub
   */
  async getUserRepositories(accessToken: string, username: string): Promise<any[]> {
    try {
      this.logger.log(`Obtendo repositórios do usuário GitHub: ${username}`);

      const response = await axios.get(`https://api.github.com/users/${username}/repos`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
        params: {
          sort: 'updated',
          per_page: 10,
        },
      });

      return response.data;
    } catch (error) {
      this.logger.error('Erro ao obter repositórios do usuário GitHub:', error.message);
      throw error;
    }
  }

  /**
   * Cria um webhook para um repositório
   */
  async createWebhook(
    accessToken: string,
    owner: string,
    repo: string,
    webhookUrl: string,
    events: string[] = ['push', 'pull_request']
  ): Promise<any> {
    try {
      this.logger.log(`Criando webhook para ${owner}/${repo}`);

      const response = await axios.post(
        `https://api.github.com/repos/${owner}/${repo}/hooks`,
        {
          name: 'web',
          active: true,
          events,
          config: {
            url: webhookUrl,
            content_type: 'json',
          },
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        }
      );

      this.logger.log(`Webhook criado com sucesso para ${owner}/${repo}`);
      return response.data;
    } catch (error) {
      this.logger.error('Erro ao criar webhook do GitHub:', error.message);
      throw error;
    }
  }

  /**
   * Valida se um token de acesso é válido
   */
  async validateToken(accessToken: string): Promise<boolean> {
    try {
      await this.getUserInfo(accessToken);
      return true;
    } catch (error) {
      this.logger.warn('Token do GitHub inválido:', error.message);
      return false;
    }
  }
}
