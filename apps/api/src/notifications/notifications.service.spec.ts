import { Test } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../prisma/prisma.service';

describe('NotificationsService', () => {
  let service: NotificationsService;
  const prismaMock = {
    pushToken: { upsert: jest.fn(), deleteMany: jest.fn() },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [NotificationsService, { provide: PrismaService, useValue: prismaMock }],
    }).compile();
    service = moduleRef.get(NotificationsService);
  });

  it('registerToken upserts on the token itself, not (userId, token)', async () => {
    await service.registerToken('user-1', { token: 'ExponentPushToken[abc]', platform: 'ios' });

    expect(prismaMock.pushToken.upsert).toHaveBeenCalledWith({
      where: { token: 'ExponentPushToken[abc]' },
      update: { userId: 'user-1', platform: 'ios' },
      create: { userId: 'user-1', token: 'ExponentPushToken[abc]', platform: 'ios' },
    });
  });

  it('removeToken only deletes tokens scoped to the caller', async () => {
    await service.removeToken('user-1', 'ExponentPushToken[abc]');

    expect(prismaMock.pushToken.deleteMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', token: 'ExponentPushToken[abc]' },
    });
  });
});
