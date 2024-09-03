import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from './user.entity';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import {
  ConflictException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

export class UserRepository extends Repository<Users> {
  private logger = new Logger('AuthController');

  constructor(@InjectRepository(Users) private repository: Repository<Users>) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  crateUser = async (authCredentialsDto: AuthCredentialsDto): Promise<void> => {
    const { username, password } = authCredentialsDto;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = this.repository.create({ username, password: hashedPassword });

    try {
      await this.repository.save(user);
      this.logger.log('User create account');
    } catch (error) {
      if (error.code === '23505') {
        this.logger.verbose(`Username: ${username} already exists`);
        throw new ConflictException('Username already exists');
      } else {
        this.logger.error('Server error');
        throw new InternalServerErrorException();
      }
    }
  };
}
