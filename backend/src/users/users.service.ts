import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from '../repositories/users/dto/createUser.dto';
import { UpdateUserDto } from '../repositories/users/dto/updateUser.dto';
import { UsersRepository } from '../repositories/users/users.repository';
import { UserDto } from './dto/user.dto';
import { Users } from '../../generated/prisma';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(data: CreateUserDto): Promise<UserDto> {
    const result = await this.usersRepository.create(data);

    if (!result) {
      throw new InternalServerErrorException('User creation failed');
    }

    return {
      id: result.externalId,
      name: result.name,
      email: result.email,
      createdAt: result.createdAt,
    };
  }

  async findOne(id: string): Promise<UserDto> {
    const result = await this.usersRepository.findOne(id);
    if (!result) {
      throw new NotFoundException('User not found');
    }
    return {
      id: result.externalId,
      name: result.name,
      email: result.email,
      createdAt: result.createdAt,
    } as UserDto;
  }

  async findByEmail(
    email: string,
  ): Promise<UserDto & { passwordHash: string }> {
    const result = await this.usersRepository.findByEmail(email);

    if (!result) {
      throw new NotFoundException('User not found');
    }

    return {
      id: result.externalId,
      name: result.name,
      email: result.email,
      createdAt: result.createdAt,
      passwordHash: result.passwordHash,
    };
  }

  async update(data: UpdateUserDto, id: string): Promise<UserDto> {
    const result = await this.usersRepository.update(data, id);

    if (!result) {
      throw new NotFoundException('User not found');
    }

    return {
      id: result.externalId,
      name: result.name,
      email: result.email,
      createdAt: result.createdAt,
    } as UserDto;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.usersRepository.delete(id);

    if (result === null) {
      throw new NotFoundException('User not found');
    }

    if (!result) {
      throw new InternalServerErrorException('User deletion failed');
    }

    return result;
  }
}
