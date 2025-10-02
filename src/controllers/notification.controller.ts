import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { NotificationService } from '../services/notification.service';
import { CreateNotificationDto, UpdateNotificationDto, MarkAsReadDto } from '../dto/notification.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  async createNotification(@Request() req, @Body() createNotificationDto: CreateNotificationDto) {
    return await this.notificationService.createNotification(createNotificationDto);
  }

  @Get()
  async getUserNotifications(
    @Request() req,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string
  ) {
    const limitNum = limit ? parseInt(limit) : 50;
    const offsetNum = offset ? parseInt(offset) : 0;
    return await this.notificationService.getUserNotifications(req.user.userId, limitNum, offsetNum);
  }

  @Get('unread')
  async getUnreadNotifications(@Request() req) {
    return await this.notificationService.getUnreadNotifications(req.user.userId);
  }

  @Get('stats')
  async getNotificationStats(@Request() req) {
    return await this.notificationService.getNotificationStats(req.user.userId);
  }

  @Get(':id')
  async getNotificationById(@Request() req, @Param('id') id: string) {
    return await this.notificationService.getNotificationById(parseInt(id), req.user.userId);
  }

  @Put('mark-read')
  async markAsRead(@Request() req, @Body() markAsReadDto: MarkAsReadDto) {
    await this.notificationService.markAsRead(req.user.userId, markAsReadDto);
    return { message: 'Notificações marcadas como lidas' };
  }

  @Put(':id')
  async updateNotification(
    @Request() req,
    @Param('id') id: string,
    @Body() updateNotificationDto: UpdateNotificationDto
  ) {
    return await this.notificationService.updateNotification(parseInt(id), req.user.userId, updateNotificationDto);
  }

  @Delete(':id')
  async deleteNotification(@Request() req, @Param('id') id: string) {
    await this.notificationService.deleteNotification(parseInt(id), req.user.userId);
    return { message: 'Notificação deletada com sucesso' };
  }
}
