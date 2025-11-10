import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ContactsRepository } from '../repositories/contacts/contacts.repository';
import { CreateContactDtoType } from './dto/create-contact.dto';
import { UpdateContactDtoType } from './dto/update-contact.dto';
import { CreateInteractionDtoType } from './dto/create-interaction.dto';

@Injectable()
export class ContactsService {
  constructor(private contactsRepository: ContactsRepository) {}

  async create(createContactDto: CreateContactDtoType) {
    try {
      const contact = await this.contactsRepository.create(createContactDto);
      
      // Calcular score inicial da IA
      const initialScore = this.calculateInitialAiScore(createContactDto);
      const insights = this.generateInitialInsights(createContactDto);
      
      if (initialScore > 0) {
        await this.contactsRepository.updateAiScore(contact.id, initialScore, insights);
      }

      return this.contactsRepository.findOne(contact.id);
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Email já cadastrado');
      }
      throw error;
    }
  }

  async findAll(filters?: {
    contactType?: string;
    status?: string;
    priority?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    return this.contactsRepository.findAll(filters);
  }

  async findOne(id: number) {
    const contact = await this.contactsRepository.findOne(id);
    if (!contact) {
      throw new NotFoundException('Contato não encontrado');
    }
    return contact;
  }

  async findByExternalId(externalId: string) {
    const contact = await this.contactsRepository.findByExternalId(externalId);
    if (!contact) {
      throw new NotFoundException('Contato não encontrado');
    }
    return contact;
  }

  async update(id: number, updateContactDto: UpdateContactDtoType) {
    const existingContact = await this.contactsRepository.findOne(id);
    if (!existingContact) {
      throw new NotFoundException('Contato não encontrado');
    }

    try {
      const updatedContact = await this.contactsRepository.update(id, updateContactDto);
      
      // Recalcular score da IA se dados relevantes mudaram
      if (this.shouldRecalculateAiScore(updateContactDto)) {
        const newScore = this.calculateAiScore(updatedContact);
        const insights = this.generateAiInsights(updatedContact);
        await this.contactsRepository.updateAiScore(id, newScore, insights);
      }

      return this.contactsRepository.findOne(id);
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Email já cadastrado');
      }
      throw error;
    }
  }

  async delete(id: number) {
    const contact = await this.contactsRepository.findOne(id);
    if (!contact) {
      throw new NotFoundException('Contato não encontrado');
    }

    return this.contactsRepository.delete(id);
  }

  async createInteraction(createInteractionDto: CreateInteractionDtoType) {
    const contact = await this.contactsRepository.findOne(createInteractionDto.contactId);
    if (!contact) {
      throw new NotFoundException('Contato não encontrado');
    }

    const interaction = await this.contactsRepository.createInteraction(createInteractionDto);
    
    // Recalcular score da IA após nova interação
    const updatedContact = await this.contactsRepository.findOne(createInteractionDto.contactId);
    const newScore = this.calculateAiScore(updatedContact);
    const insights = this.generateAiInsights(updatedContact);
    await this.contactsRepository.updateAiScore(createInteractionDto.contactId, newScore, insights);

    return interaction;
  }

  async getTopContacts(limit = 10) {
    return this.contactsRepository.getTopContacts(limit);
  }

  async getContactsByPriority(priority: string) {
    return this.contactsRepository.getContactsByPriority(priority);
  }

  async getContactsNeedingFollowUp() {
    return this.contactsRepository.getContactsNeedingFollowUp();
  }

  async getInteractionsByContact(contactId: number) {
    const contact = await this.contactsRepository.findOne(contactId);
    if (!contact) {
      throw new NotFoundException('Contato não encontrado');
    }
    return this.contactsRepository.getInteractionsByContact(contactId);
  }

  async getDashboardMetrics() {
    const [
      totalContacts,
      topContacts,
      urgentContacts,
      followUpContacts,
      recentContacts,
    ] = await Promise.all([
      this.contactsRepository.findAll({ limit: 1 }),
      this.contactsRepository.getTopContacts(5),
      this.contactsRepository.getContactsByPriority('urgent'),
      this.contactsRepository.getContactsNeedingFollowUp(),
      this.contactsRepository.findAll({ limit: 5, page: 1 }),
    ]);

    return {
      totalContacts: totalContacts.total,
      topContacts: topContacts.length,
      urgentContacts: urgentContacts.length,
      followUpContacts: followUpContacts.length,
      recentContacts: recentContacts.contacts,
      conversionRate: this.calculateConversionRate(topContacts),
    };
  }

  private calculateInitialAiScore(contact: CreateContactDtoType): number {
    let score = 30; // Score base

    // Pontuação por tipo de contato
    const typeScores = {
      lead: 40,
      prospect: 60,
      client: 90,
      partner: 80,
      supplier: 70,
    };
    score += typeScores[contact.contactType] || 0;

    // Pontuação por prioridade
    const priorityScores = {
      low: 10,
      medium: 20,
      high: 30,
      urgent: 40,
    };
    score += priorityScores[contact.priority] || 0;

    // Pontuação por dados completos
    if (contact.email) score += 15;
    if (contact.phone) score += 10;
    if (contact.company) score += 15;
    if (contact.position) score += 10;

    return Math.min(100, score);
  }

  private calculateAiScore(contact: any): number {
    let score = this.calculateInitialAiScore(contact);

    // Pontuação por interações
    const interactionCount = contact.totalInteractions || 0;
    score += Math.min(20, interactionCount * 2);

    // Pontuação por engajamento
    if (contact.emailOpens > 0) score += 5;
    if (contact.emailClicks > 0) score += 10;
    if (contact.callDuration > 0) score += 15;
    if (contact.meetingsScheduled > 0) score += 20;

    // Penalização por tempo sem interação
    if (contact.lastInteraction) {
      const daysSinceLastInteraction = Math.floor(
        (Date.now() - new Date(contact.lastInteraction).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceLastInteraction > 30) {
        score -= Math.min(20, daysSinceLastInteraction - 30);
      }
    }

    return Math.max(0, Math.min(100, score));
  }

  private generateInitialInsights(contact: CreateContactDtoType): any {
    const insights = {
      scoreFactors: [],
      recommendations: [],
      nextActions: [],
      riskFactors: [],
    };

    // Fatores de score
    if (contact.contactType === 'client') {
      insights.scoreFactors.push('Cliente ativo - alta prioridade');
    }
    if (contact.email && contact.phone) {
      insights.scoreFactors.push('Informações de contato completas');
    }

    // Recomendações
    if (contact.contactType === 'lead') {
      insights.recommendations.push('Agendar primeira ligação de qualificação');
      insights.nextActions.push('Ligar em até 24 horas');
    }

    if (!contact.nextFollowUp) {
      insights.recommendations.push('Definir data para próximo follow-up');
    }

    return insights;
  }

  private generateAiInsights(contact: any): any {
    const insights = this.generateInitialInsights(contact);

    // Análise de engajamento
    if (contact.totalInteractions > 5) {
      insights.scoreFactors.push('Alto nível de engajamento');
    } else if (contact.totalInteractions === 0) {
      insights.riskFactors.push('Nenhuma interação registrada');
      insights.nextActions.push('Realizar primeiro contato');
    }

    // Análise temporal
    if (contact.lastInteraction) {
      const daysSinceLastInteraction = Math.floor(
        (Date.now() - new Date(contact.lastInteraction).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysSinceLastInteraction > 14) {
        insights.riskFactors.push('Muito tempo sem interação');
        insights.nextActions.push('Agendar follow-up urgente');
      }
    }

    return insights;
  }

  private shouldRecalculateAiScore(updateData: UpdateContactDtoType): boolean {
    const relevantFields = [
      'contactType', 'priority', 'status', 'email', 'phone', 
      'company', 'position', 'isCustomer'
    ];
    
    return relevantFields.some(field => updateData[field] !== undefined);
  }

  private calculateConversionRate(contacts: any[]): number {
    if (contacts.length === 0) return 0;
    
    const convertedContacts = contacts.filter(c => 
      c.status === 'converted' || c.isCustomer
    );
    
    return (convertedContacts.length / contacts.length) * 100;
  }
}
