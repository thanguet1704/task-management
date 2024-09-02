import { IsEnum } from 'class-validator';
import { TaskStatus } from '../task.model';

export class UpdateStatusDto {
  @IsEnum(TaskStatus)
  status: TaskStatus;
}
