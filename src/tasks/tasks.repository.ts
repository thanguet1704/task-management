import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskStatus } from './task-status.enum';
import { FilterTaskDto } from './dto/filter-task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from 'src/auth/user.entity';

export class TasksRepository extends Repository<Task> {
  constructor(
    @InjectRepository(Task)
    private repository: Repository<Task>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  createTask = async (
    createTaskDto: CreateTaskDto,
    user: Users,
  ): Promise<Task> => {
    const { title, description } = createTaskDto;

    const task = this.repository.create({
      title,
      description,
      status: TaskStatus.OPEN,
      user,
    });

    await this.repository.save(task);

    return task;
  };

  getTasks = async (
    filterTaskDto: FilterTaskDto,
    user: Users,
  ): Promise<Task[]> => {
    const { status, search } = filterTaskDto;

    const query = this.repository.createQueryBuilder('task').where({ user });

    if (status) {
      query.andWhere('task.status = :status', { status });
    }

    if (search) {
      query.andWhere(
        'LOWER(task.title) LIKE :search OR LOWER(task.description) LIKE :search',
        {
          search: `%${search.toLowerCase()}%`,
        },
      );
    }

    const tasks = await query.getMany();
    return tasks;
  };
}
