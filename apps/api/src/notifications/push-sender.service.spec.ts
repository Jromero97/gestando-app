import { Test } from '@nestjs/testing';
import Expo from 'expo-server-sdk';
import { PushSenderService } from './push-sender.service';
import { PrismaService } from '../prisma/prisma.service';

// @nestjs/schedule and expo-server-sdk both ship ESM-only, which the default
// ts-jest transform (node_modules excluded) can't parse - mock them out.
// Everything the mock needs is defined *inside* the factory (rather than
// referenced from outer `const`s) because jest.mock calls are hoisted above
// all other statements in this file, including plain variable declarations.
jest.mock('@nestjs/schedule', () => ({
  Cron: () => () => undefined,
  CronExpression: { EVERY_HOUR: '0 * * * *' },
}));

jest.mock('expo-server-sdk', () => {
  const instance = {
    chunkPushNotifications: jest.fn((messages: unknown[]) => [messages]),
    chunkPushNotificationReceiptIds: jest.fn((ids: unknown[]) => [ids]),
    sendPushNotificationsAsync: jest.fn(),
    getPushNotificationReceiptsAsync: jest.fn(),
  };
  const ExpoMock: any = jest.fn().mockImplementation(() => instance);
  ExpoMock.isExpoPushToken = jest.fn((token: string) => token.startsWith('ExponentPushToken'));
  ExpoMock.__instance = instance;
  return { __esModule: true, default: ExpoMock, Expo: ExpoMock };
});

// Pull the mock's internals back out now that the module is mocked.
const expoInstance = (Expo as any).__instance;

describe('PushSenderService', () => {
  let service: PushSenderService;
  const prismaMock = {
    pushToken: { findMany: jest.fn(), deleteMany: jest.fn() },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [PushSenderService, { provide: PrismaService, useValue: prismaMock }],
    }).compile();
    service = moduleRef.get(PushSenderService);
  });

  it('does nothing when the user has no push tokens', async () => {
    prismaMock.pushToken.findMany.mockResolvedValue([]);

    await service.sendToUser('user-1', { title: 't', body: 'b' });

    expect(expoInstance.sendPushNotificationsAsync).not.toHaveBeenCalled();
  });

  it('filters out malformed tokens before sending', async () => {
    prismaMock.pushToken.findMany.mockResolvedValue([{ token: 'not-a-real-token' }]);

    await service.sendToUser('user-1', { title: 't', body: 'b' });

    expect(expoInstance.sendPushNotificationsAsync).not.toHaveBeenCalled();
  });

  it('sends to valid tokens and immediately prunes a DeviceNotRegistered ticket', async () => {
    prismaMock.pushToken.findMany.mockResolvedValue([{ token: 'ExponentPushToken[dead]' }]);
    expoInstance.sendPushNotificationsAsync.mockResolvedValue([
      { status: 'error', message: 'gone', details: { error: 'DeviceNotRegistered' } },
    ]);

    await service.sendToUser('user-1', { title: 't', body: 'b' });

    expect(expoInstance.sendPushNotificationsAsync).toHaveBeenCalledWith([
      expect.objectContaining({ to: 'ExponentPushToken[dead]', title: 't', body: 'b' }),
    ]);
    expect(prismaMock.pushToken.deleteMany).toHaveBeenCalledWith({ where: { token: 'ExponentPushToken[dead]' } });
  });

  it('checkReceipts prunes tokens whose delivery receipt comes back DeviceNotRegistered', async () => {
    prismaMock.pushToken.findMany.mockResolvedValue([{ token: 'ExponentPushToken[live]' }]);
    expoInstance.sendPushNotificationsAsync.mockResolvedValue([{ status: 'ok', id: 'receipt-1' }]);
    await service.sendToUser('user-1', { title: 't', body: 'b' });

    expoInstance.getPushNotificationReceiptsAsync.mockResolvedValue({
      'receipt-1': { status: 'error', message: 'gone', details: { error: 'DeviceNotRegistered' } },
    });

    await service.checkReceipts();

    expect(prismaMock.pushToken.deleteMany).toHaveBeenCalledWith({ where: { token: 'ExponentPushToken[live]' } });
  });

  it('checkReceipts is a no-op when there are no pending receipts', async () => {
    await service.checkReceipts();

    expect(expoInstance.getPushNotificationReceiptsAsync).not.toHaveBeenCalled();
  });
});
