import { IsString, IsEnum, IsOptional, IsInt, IsBoolean, IsObject } from 'class-validator';
import { NotificationType, NotificationStatus } from '../entities/notification.entity';

export class CreateNotificationDto {
  @IsInt()
  user_id: number;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsObject()
  data?: any;

  @IsOptional()
  @IsBoolean()
  is_important?: boolean;
}

export class UpdateNotificationDto {
  @IsOptional()
  @IsEnum(NotificationStatus)
  status?: NotificationStatus;

  @IsOptional()
  @IsBoolean()
  is_important?: boolean;
}

export class MarkAsReadDto {
  @IsOptional()
  @IsInt()
  notification_id?: number;

  @IsOptional()
  @IsBoolean()
  mark_all?: boolean;
}
