import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AnalysisModule } from './analysis/analysis.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // max 100 requests per minute
      },
    ]),
    PrismaModule,
    AnalysisModule,
    HealthModule,
  ],
})
export class AppModule {}
