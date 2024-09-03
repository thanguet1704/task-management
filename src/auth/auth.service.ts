import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from './user.repository';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserRepository) private userRepository: UserRepository,
    private jwtService: JwtService,
  ) {}

  signUp = async (authCredentialsDto: AuthCredentialsDto): Promise<void> => {
    return this.userRepository.crateUser(authCredentialsDto);
  };

  signIn = async (
    authCredentialsDto: AuthCredentialsDto,
  ): Promise<{ accessToken: string }> => {
    const { username, password } = authCredentialsDto;

    const user = await this.userRepository.findOne({ where: { username } });
    const isPasswordCorrect = await bcrypt.compare(password, user?.password);

    if (user && isPasswordCorrect) {
      const payload: JwtPayload = {
        username,
      };
      const accessToken = await this.jwtService.sign(payload);

      return { accessToken };
    }

    throw new UnauthorizedException('Please check login credentials');
  };
}
