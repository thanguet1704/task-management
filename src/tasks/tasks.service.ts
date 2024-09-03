import { Injectable, NotFoundException } from '@nestjs/common';
import { TaskStatus } from './task-status.enum';
import { CreateTaskDto } from './dto/create-task.dto';
import { FilterTaskDto } from './dto/filter-task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { TasksRepository } from './tasks.repository';
import { Users } from 'src/auth/user.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TasksRepository)
    private taskRepository: TasksRepository,
  ) {}

  getTasks = async (
    filterTaskDto: FilterTaskDto,
    user: Users,
  ): Promise<Task[]> => {
    return this.taskRepository.getTasks(filterTaskDto, user);
  };

  createTask = async (
    createTaskDto: CreateTaskDto,
    user: Users,
  ): Promise<Task> => {
    return this.taskRepository.createTask(createTaskDto, user);
  };

  getTaskById = async (id: string, user: Users): Promise<Task> => {
    const task = await this.taskRepository.findOne({ where: { id, user } });

    if (!task) {
      throw new NotFoundException(`Task with id ${id} not found`);
    }

    return task;
  };

  deleteTaskById = async (id: string, user: Users): Promise<void> => {
    const result = await this.taskRepository.delete({ id, user });

    if (result.affected === 0) {
      throw new NotFoundException(`Task with id ${id} not found`);
    }
  };

  updateStatus = async (
    id: string,
    status: TaskStatus,
    user: Users,
  ): Promise<Task> => {
    const task = await this.getTaskById(id, user);

    task.status = status;
    await this.taskRepository.save(task);

    return task;
  };
}
