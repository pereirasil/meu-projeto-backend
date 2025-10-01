import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GitHubController } from '../controllers/github.controller';
import { GitHubService } from '../services/github.service';
import { AuthModule } from './auth.module';

@Module({
  imports: [ConfigModule, AuthModule],
  controllers: [GitHubController],
  providers: [GitHubService],
  exports: [GitHubService],
})
export class GitHubModule {}
