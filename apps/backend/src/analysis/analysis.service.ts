import { Injectable, Logger } from '@nestjs/common';
import { analyzeCode } from '@dsa-analyzer/analyzer';
import type { AnalysisResult } from '@dsa-analyzer/shared';
import { PrismaService } from '../prisma/prisma.service';
import type { AnalyzeDto } from './dto/analyze.dto';

export interface AnalysisServiceResult extends AnalysisResult {
  id: string;
  analyzedAt: string;
}

@Injectable()
export class AnalysisService {
  private readonly logger = new Logger(AnalysisService.name);

  constructor(private readonly prisma: PrismaService) {}

  async analyze(dto: AnalyzeDto): Promise<AnalysisServiceResult> {
    this.logger.log(`Analyzing code: language=${dto.language ?? 'auto'}, platform=${dto.platform ?? 'unknown'}`);

    // Run analysis engine
    const result = analyzeCode(dto.code, {
      language: dto.language,
    });

    // Persist to database
    let record: { id: string; createdAt: Date };
    try {
      record = await this.prisma.analysisHistory.create({
        data: {
          code: dto.code,
          language: result.language,
          approach: result.approach,
          timeComplexity: result.timeComplexity,
          spaceComplexity: result.spaceComplexity,
          optimization: result.optimization,
          platform: dto.platform,
          confidence: result.confidence,
        },
        select: { id: true, createdAt: true },
      });
    } catch (error) {
      // Non-fatal: log but don't fail the analysis
      this.logger.warn('Failed to persist analysis to DB', error);
      record = { id: 'local-' + Date.now(), createdAt: new Date() };
    }

    return {
      ...result,
      id: record.id,
      analyzedAt: record.createdAt.toISOString(),
    };
  }

  async getHistory(limit = 20, offset = 0) {
    return this.prisma.analysisHistory.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        language: true,
        approach: true,
        timeComplexity: true,
        spaceComplexity: true,
        optimization: true,
        platform: true,
        confidence: true,
        createdAt: true,
      },
    });
  }

  async getStats() {
    const [total, byApproach, byLanguage] = await Promise.all([
      this.prisma.analysisHistory.count(),
      this.prisma.analysisHistory.groupBy({
        by: ['approach'],
        _count: { approach: true },
        orderBy: { _count: { approach: 'desc' } },
        take: 10,
      }),
      this.prisma.analysisHistory.groupBy({
        by: ['language'],
        _count: { language: true },
        orderBy: { _count: { language: 'desc' } },
      }),
    ]);

    return { total, byApproach, byLanguage };
  }
}
