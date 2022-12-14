import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/createUser.dto';
import { UserEntity } from './user.entity';
import { sign } from 'jsonwebtoken';
import { JWT_SECRET } from 'src/config';
import { UserResponseInterface } from '../types/userResponse.interface';
import { compare } from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}
  async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
    const userByEmail = await this.userRepository.findOne({
      where: {
        email: createUserDto.email,
      },
    });
    const userByUsername = await this.userRepository.findOne({
      where: {
        username: createUserDto.username,
      },
    });

    if (userByEmail || userByUsername) {
      throw new HttpException(
        'Username or emailadres already exists',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const newUser = new UserEntity();
    Object.assign(newUser, createUserDto);
    return this.userRepository.save(newUser);
  }

  async loginUser(loginUserDto: CreateUserDto): Promise<UserEntity> {
    const userByUsername = await this.userRepository.findOne({
      where: { username: loginUserDto.username },
      select: ['id', 'username', 'email', 'password', 'bio', 'image'],
    });
    if (!userByUsername) {
      throw new HttpException('Username not found', HttpStatus.NOT_FOUND);
    }

    const match = await compare(loginUserDto.password, userByUsername.password);

    if (!match) {
      throw new HttpException(
        'Password incorrect',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    delete userByUsername.password;
    return userByUsername;
  }

  generateJwt(user: UserEntity): string {
    return sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      JWT_SECRET,
    );
  }

  buildUserResponse(user: UserEntity): UserResponseInterface {
    return { user: { ...user, token: this.generateJwt(user) } };
  }
}
