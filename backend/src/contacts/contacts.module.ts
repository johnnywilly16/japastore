import { Module } from '@nestjs/common';
import { ContactsController } from './contacts.controller';
import { ContactsPublicController } from './contacts-public.controller';
import { ContactsService } from './contacts.service';
import { ContactsRepository } from '../repositories/contacts/contacts.repository';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [ContactsController, ContactsPublicController],
  providers: [ContactsService, ContactsRepository, PrismaService],
  exports: [ContactsService],
})
export class ContactsModule {}
