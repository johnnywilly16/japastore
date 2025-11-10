import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { CreateContactDto, CreateContactDtoType } from './dto/create-contact.dto';
import { UpdateContactDto, UpdateContactDtoType } from './dto/update-contact.dto';
import { CreateInteractionDto, CreateInteractionDtoType } from './dto/create-interaction.dto';
import { ZodValidationPipe } from '../pipes/zodValidation.pipe';
import { AuthGuard } from '../guards/auth.guard';
import { SkipAuth } from '../decorators/skipAuth.decorator';

@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  @SkipAuth()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body(new ZodValidationPipe(CreateContactDto)) createContactDto: CreateContactDtoType
  ) {
    return this.contactsService.create(createContactDto);
  }

  @Get()
  @SkipAuth()
  findAll(
    @Query('contactType') contactType?: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const filters = {
      contactType,
      status,
      priority,
      search,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    };

    return this.contactsService.findAll(filters);
  }

  @Get('dashboard')
  getDashboardMetrics() {
    return this.contactsService.getDashboardMetrics();
  }

  @Get('top')
  getTopContacts(@Query('limit') limit?: string) {
    const limitNumber = limit ? parseInt(limit) : 10;
    return this.contactsService.getTopContacts(limitNumber);
  }

  @Get('priority/:priority')
  getContactsByPriority(@Param('priority') priority: string) {
    return this.contactsService.getContactsByPriority(priority);
  }

  @Get('follow-up')
  getContactsNeedingFollowUp() {
    return this.contactsService.getContactsNeedingFollowUp();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.contactsService.findOne(id);
  }

  @Get('external/:externalId')
  findByExternalId(@Param('externalId') externalId: string) {
    return this.contactsService.findByExternalId(externalId);
  }

  @Patch(':id')
  @SkipAuth()
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateContactDto)) updateContactDto: UpdateContactDtoType
  ) {
    return this.contactsService.update(id, updateContactDto);
  }

  @Delete(':id')
  @SkipAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.contactsService.delete(id);
  }

  @Post('interactions')
  @HttpCode(HttpStatus.CREATED)
  createInteraction(
    @Body(new ZodValidationPipe(CreateInteractionDto)) createInteractionDto: CreateInteractionDtoType
  ) {
    return this.contactsService.createInteraction(createInteractionDto);
  }

  @Get(':id/interactions')
  getInteractionsByContact(@Param('id', ParseIntPipe) id: number) {
    return this.contactsService.getInteractionsByContact(id);
  }
}
