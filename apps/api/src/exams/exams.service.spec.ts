import { Test } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { ExamsService } from './exams.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ExamsService', () => {
  let service: ExamsService;
  const prismaMock = {
    exam: { create: jest.fn(), findMany: jest.fn(), count: jest.fn(), findUnique: jest.fn(), delete: jest.fn() },
    $transaction: jest.fn((ops: Promise<unknown>[]) => Promise.all(ops)),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [ExamsService, { provide: PrismaService, useValue: prismaMock }],
    }).compile();
    service = moduleRef.get(ExamsService);
  });

  it('remove throws ForbiddenException when the exam belongs to another user', async () => {
    prismaMock.exam.findUnique.mockResolvedValue({ id: 'exam-1', userId: 'other-user' });

    await expect(service.remove('user-1', 'exam-1')).rejects.toThrow(ForbiddenException);
    expect(prismaMock.exam.delete).not.toHaveBeenCalled();
  });
});
