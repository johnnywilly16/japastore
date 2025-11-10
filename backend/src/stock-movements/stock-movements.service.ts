import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { StockMovementResponseDto, StockMovementStatsDto } from './dto/stock-movement-response.dto';
import { StockMovementFilters } from './dto/stock-movement-filters.dto';

@Injectable()
export class StockMovementsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters?: StockMovementFilters): Promise<StockMovementResponseDto[]> {
    const where: any = {};

    if (filters?.type) {
      where.movementType = filters.type;
    }

    if (filters?.productId) {
      const product = await this.prisma.products.findUnique({
        where: { externalId: filters.productId },
      });
      if (product) {
        where.productId = product.id;
      }
    }

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    const skip = filters?.page && filters?.limit ? (filters.page - 1) * filters.limit : undefined;
    const take = filters?.limit;

    const movements = await this.prisma.stockMovements.findMany({
      where,
      include: {
        Product: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take,
    });

    return movements.map((movement) => this.mapToResponseDto(movement));
  }

  async findByProduct(productId: string): Promise<StockMovementResponseDto[]> {
    const product = await this.prisma.products.findUnique({
      where: { externalId: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const movements = await this.prisma.stockMovements.findMany({
      where: {
        productId: product.id,
      },
      include: {
        Product: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return movements.map((movement) => this.mapToResponseDto(movement));
  }

  async findOne(id: number): Promise<StockMovementResponseDto> {
    const movement = await this.prisma.stockMovements.findUnique({
      where: { id },
      include: {
        Product: true,
      },
    });

    if (!movement) {
      throw new NotFoundException('Stock movement not found');
    }

    return this.mapToResponseDto(movement);
  }

  async getStats(period?: '7d' | '30d' | '90d' | '1y'): Promise<StockMovementStatsDto> {
    const now = new Date();
    let startDate: Date;
    let periodLabel: string;

    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        periodLabel = '7 days';
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        periodLabel = '30 days';
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        periodLabel = '90 days';
        break;
      case '1y':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        periodLabel = '1 year';
        break;
      default:
        startDate = new Date(0);
        periodLabel = 'all time';
    }

    const [totalAdditions, totalRemovals, additionsByPeriod, removalsByPeriod] = await Promise.all([
      this.prisma.stockMovements.aggregate({
        where: { movementType: 'addition' },
        _sum: { quantity: true },
      }),
      this.prisma.stockMovements.aggregate({
        where: { movementType: 'removal' },
        _sum: { quantity: true },
      }),
      this.prisma.stockMovements.aggregate({
        where: {
          movementType: 'addition',
          createdAt: { gte: startDate },
        },
        _sum: { quantity: true },
      }),
      this.prisma.stockMovements.aggregate({
        where: {
          movementType: 'removal',
          createdAt: { gte: startDate },
        },
        _sum: { quantity: true },
      }),
    ]);

    return {
      totalAdditions: Number(totalAdditions._sum.quantity || 0),
      totalRemovals: Number(totalRemovals._sum.quantity || 0),
      additionsByPeriod: Number(additionsByPeriod._sum.quantity || 0),
      removalsByPeriod: Number(removalsByPeriod._sum.quantity || 0),
      period: periodLabel,
    };
  }

  private mapToResponseDto(movement: any): StockMovementResponseDto {
    return {
      id: movement.id,
      productId: movement.Product.externalId,
      product: {
        id: movement.Product.externalId,
        name: movement.Product.name,
      },
      movementType: movement.movementType,
      referenceType: movement.referenceType,
      referenceId: movement.referenceId,
      quantity: movement.quantity,
      unitPrice: Number(movement.unitPrice),
      notes: movement.notes || undefined,
      createdAt: movement.createdAt,
      updatedAt: movement.updatedAt,
    };
  }
}

