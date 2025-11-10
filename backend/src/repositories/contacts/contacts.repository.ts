import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateContactDtoType } from '../../contacts/dto/create-contact.dto';
import { UpdateContactDtoType } from '../../contacts/dto/update-contact.dto';
import { CreateInteractionDtoType } from '../../contacts/dto/create-interaction.dto';

@Injectable()
export class ContactsRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateContactDtoType) {
    const contact = await this.prisma.contacts.create({
      data: {
        ...data,
        nextFollowUp: data.nextFollowUp ? new Date(data.nextFollowUp) : null,
      },
      include: {
        customer: true,
        ContactInteractions: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        _count: {
          select: { ContactInteractions: true },
        },
      },
    });

    return contact;
  }

  async findAll(filters?: {
    contactType?: string;
    status?: string;
    priority?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const where: any = {};
    
    if (filters?.contactType) {
      where.contactType = filters.contactType;
    }
    
    if (filters?.status) {
      where.status = filters.status;
    }
    
    if (filters?.priority) {
      where.priority = filters.priority;
    }
    
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { company: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const [contacts, total] = await Promise.all([
      this.prisma.contacts.findMany({
        where,
        include: {
          customer: true,
          ContactInteractions: {
            orderBy: { createdAt: 'desc' },
            take: 3,
          },
          _count: {
            select: { ContactInteractions: true },
          },
        },
        orderBy: [
          { aiScore: 'desc' },
          { priority: 'desc' },
          { updatedAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
      this.prisma.contacts.count({ where }),
    ]);

    return {
      contacts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    };
  }

  async findOne(id: number) {
    return this.prisma.contacts.findUnique({
      where: { id },
      include: {
        customer: true,
        ContactInteractions: {
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { ContactInteractions: true },
        },
      },
    });
  }

  async findByExternalId(externalId: string) {
    return this.prisma.contacts.findUnique({
      where: { externalId },
      include: {
        customer: true,
        ContactInteractions: {
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { ContactInteractions: true },
        },
      },
    });
  }

  async update(id: number, data: UpdateContactDtoType) {
    return this.prisma.contacts.update({
      where: { id },
      data: {
        ...data,
        nextFollowUp: data.nextFollowUp ? new Date(data.nextFollowUp) : undefined,
        lastAiAnalysis: data.aiScore || data.aiInsights ? new Date() : undefined,
      },
      include: {
        customer: true,
        ContactInteractions: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        _count: {
          select: { ContactInteractions: true },
        },
      },
    });
  }

  async delete(id: number) {
    return this.prisma.contacts.delete({
      where: { id },
    });
  }

  async createInteraction(data: CreateInteractionDtoType) {
    const interaction = await this.prisma.contactInteractions.create({
      data: {
        ...data,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
        completedAt: data.completedAt ? new Date(data.completedAt) : null,
        followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
      },
      include: {
        contact: true,
      },
    });

    // Atualizar estatísticas do contato
    await this.prisma.contacts.update({
      where: { id: data.contactId },
      data: {
        totalInteractions: { increment: 1 },
        lastInteraction: new Date(),
      },
    });

    return interaction;
  }

  async getTopContacts(limit = 10) {
    return this.prisma.contacts.findMany({
      where: {
        aiScore: { gt: 0 },
      },
      orderBy: [
        { aiScore: 'desc' },
        { totalInteractions: 'desc' },
      ],
      include: {
        customer: true,
        _count: {
          select: { ContactInteractions: true },
        },
      },
      take: limit,
    });
  }

  async getContactsByPriority(priority: string) {
    return this.prisma.contacts.findMany({
      where: { priority: priority as any },
      include: {
        customer: true,
        ContactInteractions: {
          orderBy: { createdAt: 'desc' },
          take: 3,
        },
      },
      orderBy: { aiScore: 'desc' },
    });
  }

  async getContactsNeedingFollowUp() {
    const today = new Date();
    return this.prisma.contacts.findMany({
      where: {
        nextFollowUp: { lte: today },
        status: { in: ['active', 'qualified'] },
      },
      include: {
        customer: true,
        ContactInteractions: {
          orderBy: { createdAt: 'desc' },
          take: 3,
        },
      },
      orderBy: { nextFollowUp: 'asc' },
    });
  }

  async updateAiScore(contactId: number, score: number, insights: any) {
    return this.prisma.contacts.update({
      where: { id: contactId },
      data: {
        aiScore: score,
        aiInsights: insights,
        lastAiAnalysis: new Date(),
      },
    });
  }

  async getInteractionsByContact(contactId: number) {
    return this.prisma.contactInteractions.findMany({
      where: { contactId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
