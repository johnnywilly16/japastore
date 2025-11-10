import {Body, Controller, Get, Param, Post} from '@nestjs/common';
import { UsersService } from './users.service';
import {ZodValidationPipe} from "@pipes/zodValidation.pipe";
import {CreateUserDto, CreateUserDtoSchema} from "@repositories/users/dto/createUser.dto";

@Controller({
  version: '1',
  path: '/users',
})
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(
    @Body(new ZodValidationPipe(CreateUserDtoSchema))
    createUserDto: CreateUserDto,
  ) {
    return this.usersService.create(createUserDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  // @Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body(new ZodValidationPipe(UpdateUserDtoSchema))
  //   updateUserDto: UpdateUserDto,
  // ) {
  //   return this.usersService.update(updateUserDto, id);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.usersService.delete(id);
  // }
}
