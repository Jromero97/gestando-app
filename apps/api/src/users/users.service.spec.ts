import { Test } from '@nestjs/testing';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseStorageService } from '../storage/supabase-storage.service';

describe('UsersService', () => {
  let service: UsersService;
  const prismaMock = {
    user: { findUnique: jest.fn(), update: jest.fn(), delete: jest.fn() },
    diaryEntry: { deleteMany: jest.fn() },
    milestonePhoto: { deleteMany: jest.fn() },
    appointment: { deleteMany: jest.fn() },
    exam: { deleteMany: jest.fn() },
    pregnancyProfile: { deleteMany: jest.fn() },
    $transaction: jest.fn((ops: unknown[]) => Promise.all(ops)),
  };
  const storageMock = { deleteAllForUser: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: SupabaseStorageService, useValue: storageMock },
      ],
    }).compile();
    service = moduleRef.get(UsersService);
  });

  it('findMe throws NotFoundException when the user does not exist', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(service.findMe('user-1')).rejects.toThrow(NotFoundException);
  });

  it('findMe never selects passwordHash', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'user-1', email: 'a@b.com' });

    await service.findMe('user-1');

    const select = prismaMock.user.findUnique.mock.calls[0][0].select;
    expect(select.passwordHash).toBeUndefined();
  });

  it('updateMe writes the provided fields and returns the public shape', async () => {
    prismaMock.user.update.mockResolvedValue({ id: 'user-1', firstName: 'Ana' });

    await service.updateMe('user-1', { firstName: 'Ana', heightCm: 165 });

    expect(prismaMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'user-1' },
        data: { firstName: 'Ana', heightCm: 165 },
      }),
    );
  });

  describe('remove', () => {
    it('throws NotFoundException when the user does not exist', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(service.remove('user-1', 'whatever')).rejects.toThrow(NotFoundException);
      expect(storageMock.deleteAllForUser).not.toHaveBeenCalled();
    });

    it('throws UnauthorizedException on a wrong password and deletes nothing', async () => {
      const passwordHash = await bcrypt.hash('correct-password', 4);
      prismaMock.user.findUnique.mockResolvedValue({ id: 'user-1', passwordHash });

      await expect(service.remove('user-1', 'wrong-password')).rejects.toThrow(UnauthorizedException);
      expect(storageMock.deleteAllForUser).not.toHaveBeenCalled();
      expect(prismaMock.user.delete).not.toHaveBeenCalled();
    });

    it('purges storage then deletes the user row on a correct password', async () => {
      const passwordHash = await bcrypt.hash('correct-password', 4);
      prismaMock.user.findUnique.mockResolvedValue({ id: 'user-1', passwordHash });

      await service.remove('user-1', 'correct-password');

      expect(storageMock.deleteAllForUser).toHaveBeenCalledWith('user-1');
      expect(prismaMock.user.delete).toHaveBeenCalledWith({ where: { id: 'user-1' } });
    });
  });

  describe('withdrawHealthDataConsent', () => {
    it('throws NotFoundException when the user does not exist', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(service.withdrawHealthDataConsent('user-1', 'whatever')).rejects.toThrow(NotFoundException);
      expect(storageMock.deleteAllForUser).not.toHaveBeenCalled();
    });

    it('throws UnauthorizedException on a wrong password and deletes nothing', async () => {
      const passwordHash = await bcrypt.hash('correct-password', 4);
      prismaMock.user.findUnique.mockResolvedValue({ id: 'user-1', passwordHash });

      await expect(service.withdrawHealthDataConsent('user-1', 'wrong-password')).rejects.toThrow(
        UnauthorizedException,
      );
      expect(storageMock.deleteAllForUser).not.toHaveBeenCalled();
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
    });

    it('purges storage and every health-data table, and clears the health fields on User', async () => {
      const passwordHash = await bcrypt.hash('correct-password', 4);
      prismaMock.user.findUnique.mockResolvedValue({ id: 'user-1', passwordHash });

      await service.withdrawHealthDataConsent('user-1', 'correct-password');

      expect(storageMock.deleteAllForUser).toHaveBeenCalledWith('user-1');
      expect(prismaMock.diaryEntry.deleteMany).toHaveBeenCalledWith({ where: { userId: 'user-1' } });
      expect(prismaMock.milestonePhoto.deleteMany).toHaveBeenCalledWith({ where: { userId: 'user-1' } });
      expect(prismaMock.appointment.deleteMany).toHaveBeenCalledWith({ where: { userId: 'user-1' } });
      expect(prismaMock.exam.deleteMany).toHaveBeenCalledWith({ where: { userId: 'user-1' } });
      expect(prismaMock.pregnancyProfile.deleteMany).toHaveBeenCalledWith({ where: { userId: 'user-1' } });
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: expect.objectContaining({
          heightCm: null,
          prePregnancyWeightKg: null,
          healthDataConsentAt: null,
          healthDataConsentWithdrawnAt: expect.any(Date),
        }),
      });
    });
  });
});
