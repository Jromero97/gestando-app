import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import Expo, { ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';
import { PrismaService } from '../prisma/prisma.service';

export interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

interface PendingReceipt {
  receiptId: string;
  token: string;
}

/**
 * Thin wrapper around expo-server-sdk. Invalid tokens are pruned two ways:
 * immediately, from ticket-level errors (Expo already knows the token is
 * bad); and on a delayed pass, from delivery receipts (Expo only learns the
 * device unregistered once it actually tries to deliver). Receipt ids are
 * kept in memory between the two passes rather than a new table - losing a
 * pending batch on a process restart just means a handful of dead tokens
 * get pruned on their next failed send instead, which is self-healing.
 */
@Injectable()
export class PushSenderService {
  private readonly logger = new Logger(PushSenderService.name);
  private readonly expo = new Expo();
  private pendingReceipts: PendingReceipt[] = [];

  constructor(private readonly prisma: PrismaService) {}

  async sendToUser(userId: string, payload: PushPayload): Promise<void> {
    const tokens = await this.prisma.pushToken.findMany({ where: { userId } });
    const validTokens = tokens.filter((t) => Expo.isExpoPushToken(t.token));
    if (validTokens.length === 0) return;

    const messages: ExpoPushMessage[] = validTokens.map((t) => ({
      to: t.token,
      title: payload.title,
      body: payload.body,
      data: payload.data,
      sound: 'default',
    }));

    for (const chunk of this.expo.chunkPushNotifications(messages)) {
      let tickets: ExpoPushTicket[];
      try {
        tickets = await this.expo.sendPushNotificationsAsync(chunk);
      } catch (err) {
        this.logger.error(`Failed to send a push notification chunk: ${err}`);
        continue;
      }
      await this.handleTickets(chunk, tickets);
    }
  }

  private async handleTickets(chunk: ExpoPushMessage[], tickets: ExpoPushTicket[]) {
    for (let i = 0; i < tickets.length; i++) {
      const ticket = tickets[i];
      const token = chunk[i].to as string;
      if (ticket.status === 'error') {
        if (ticket.details?.error === 'DeviceNotRegistered') {
          await this.pruneToken(token);
        } else {
          this.logger.warn(`Push ticket error for a token: ${ticket.message}`);
        }
      } else {
        this.pendingReceipts.push({ receiptId: ticket.id, token });
      }
    }
  }

  /** Delivery receipts become available some time after the ticket is issued. */
  @Cron(CronExpression.EVERY_HOUR)
  async checkReceipts(): Promise<void> {
    if (this.pendingReceipts.length === 0) return;
    const batch = this.pendingReceipts.splice(0, this.pendingReceipts.length);

    for (const chunk of this.expo.chunkPushNotificationReceiptIds(batch.map((b) => b.receiptId))) {
      let receipts: Awaited<ReturnType<Expo['getPushNotificationReceiptsAsync']>>;
      try {
        receipts = await this.expo.getPushNotificationReceiptsAsync(chunk);
      } catch (err) {
        this.logger.error(`Failed to fetch push receipts: ${err}`);
        continue;
      }
      for (const [receiptId, receipt] of Object.entries(receipts)) {
        if (receipt.status === 'error' && receipt.details?.error === 'DeviceNotRegistered') {
          const entry = batch.find((b) => b.receiptId === receiptId);
          if (entry) await this.pruneToken(entry.token);
        }
      }
    }
  }

  private async pruneToken(token: string) {
    await this.prisma.pushToken.deleteMany({ where: { token } });
  }
}
