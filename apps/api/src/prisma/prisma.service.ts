import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// Prisma ORM 7 removed the built-in connection engine: PrismaClient() now
// requires an explicit driver adapter. Docs: https://pris.ly/d/driver-adapters
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
