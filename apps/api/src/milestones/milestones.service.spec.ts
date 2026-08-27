import { Test } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { MilestonesService } from './milestones.service';
import { PrismaService } from '../prisma/prisma.service';

describe('MilestonesService', () => {
  let service: MilestonesService;
  const prismaMock = {
    milestonePhoto: { create: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), delete: jest.fn() },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [MilestonesService, { provide: PrismaService, useValue: prismaMock }],
    }).compile();
    service = moduleRef.get(MilestonesService);
  });

  it('findAllByWeek orders by weekNumber ascending', async () => {
    prismaMock.milestonePhoto.findMany.mockResolvedValue([]);

    await service.findAllByWeek('user-1');

    expect(prismaMock.milestonePhoto.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      orderBy: { weekNumber: 'asc' },
    });
  });

  it('remove throws ForbiddenException when the photo belongs to another user', async () => {
    prismaMock.milestonePhoto.findUnique.mockResolvedValue({ id: 'photo-1', userId: 'other-user' });

    await expect(service.remove('user-1', 'photo-1')).rejects.toThrow(ForbiddenException);
  });
});
