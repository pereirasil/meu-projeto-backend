import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType, NotificationStatus } from '../entities/notification.entity';
import { CreateNotificationDto, UpdateNotificationDto, MarkAsReadDto } from '../dto/notification.dto';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  async createNotification(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationRepository.create({
      ...createNotificationDto,
      is_important: createNotificationDto.is_important || false,
    });

    return await this.notificationRepository.save(notification);
  }

  async getUserNotifications(userId: number, limit: number = 50, offset: number = 0): Promise<Notification[]> {
    return await this.notificationRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  async getUnreadNotifications(userId: number): Promise<Notification[]> {
    return await this.notificationRepository.find({
      where: { 
        user_id: userId, 
        status: NotificationStatus.UNREAD 
      },
      order: { created_at: 'DESC' },
    });
  }

  async getNotificationById(notificationId: number, userId: number): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, user_id: userId },
    });

    if (!notification) {
      throw new NotFoundException('Notificação não encontrada');
    }

    return notification;
  }

  async markAsRead(userId: number, markAsReadDto: MarkAsReadDto): Promise<void> {
    if (markAsReadDto.mark_all) {
      await this.notificationRepository.update(
        { user_id: userId, status: NotificationStatus.UNREAD },
        { 
          status: NotificationStatus.READ,
          read_at: new Date()
        }
      );
    } else if (markAsReadDto.notification_id) {
      const notification = await this.getNotificationById(markAsReadDto.notification_id, userId);
      notification.status = NotificationStatus.READ;
      notification.read_at = new Date();
      await this.notificationRepository.save(notification);
    }
  }

  async updateNotification(notificationId: number, userId: number, updateNotificationDto: UpdateNotificationDto): Promise<Notification> {
    const notification = await this.getNotificationById(notificationId, userId);
    
    Object.assign(notification, updateNotificationDto);
    
    if (updateNotificationDto.status === NotificationStatus.READ && !notification.read_at) {
      notification.read_at = new Date();
    }

    return await this.notificationRepository.save(notification);
  }

  async deleteNotification(notificationId: number, userId: number): Promise<void> {
    const notification = await this.getNotificationById(notificationId, userId);
    await this.notificationRepository.remove(notification);
  }

  async getNotificationStats(userId: number): Promise<{ total: number; unread: number; important: number }> {
    const [total, unread, important] = await Promise.all([
      this.notificationRepository.count({ where: { user_id: userId } }),
      this.notificationRepository.count({ 
        where: { user_id: userId, status: NotificationStatus.UNREAD } 
      }),
      this.notificationRepository.count({ 
        where: { user_id: userId, is_important: true, status: NotificationStatus.UNREAD } 
      }),
    ]);

    return { total, unread, important };
  }

  async createTaskAssignedNotification(userId: number, taskTitle: string, boardName: string, data?: any): Promise<Notification> {
    return await this.createNotification({
      user_id: userId,
      type: NotificationType.TASK_ASSIGNED,
      title: 'Nova tarefa atribuída',
      message: `Você foi atribuído à tarefa "${taskTitle}" no board "${boardName}"`,
      data: data,
    });
  }

  async createSprintStartedNotification(userId: number, sprintName: string, boardName: string, data?: any): Promise<Notification> {
    return await this.createNotification({
      user_id: userId,
      type: NotificationType.SPRINT_STARTED,
      title: 'Sprint iniciada',
      message: `A sprint "${sprintName}" foi iniciada no board "${boardName}"`,
      data: data,
    });
  }

  async createBoardInviteNotification(userId: number, boardName: string, inviterName: string, data?: any): Promise<Notification> {
    return await this.createNotification({
      user_id: userId,
      type: NotificationType.BOARD_INVITE,
      title: 'Convite para board',
      message: `${inviterName} convidou você para participar do board "${boardName}"`,
      data: data,
      is_important: true,
    });
  }

  async createDeadlineReminderNotification(userId: number, taskTitle: string, deadline: string, data?: any): Promise<Notification> {
    return await this.createNotification({
      user_id: userId,
      type: NotificationType.DEADLINE_REMINDER,
      title: 'Lembrete de prazo',
      message: `A tarefa "${taskTitle}" vence em ${deadline}`,
      data: data,
      is_important: true,
    });
  }
}
