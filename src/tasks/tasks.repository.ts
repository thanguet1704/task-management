import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskStatus } from './task-status.enum';
import { FilterTaskDto } from './dto/filter-task.dto';
import { InjectRepository } from '@nestjs/typeorm';

export class TasksRepository extends Repository<Task> {
  constructor(
    @InjectRepository(Task)
    private repository: Repository<Task>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  createTask = async (createTaskDto: CreateTaskDto): Promise<Task> => {
    const { title, description } = createTaskDto;

    const task = this.repository.create({
      title,
      description,
      status: TaskStatus.OPEN,
    });

    await this.repository.save(task);

    return task;
  };

  getTasks = async (filterTaskDto: FilterTaskDto): Promise<Task[]> => {
    const { status, search } = filterTaskDto;

    const query = this.repository.createQueryBuilder('task');

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
