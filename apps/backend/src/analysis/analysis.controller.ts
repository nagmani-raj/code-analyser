import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AnalysisService } from './analysis.service';
import { AnalyzeDto } from './dto/analyze.dto';

@ApiTags('analysis')
@Controller()
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  /**
   * POST /analyze
   * Main endpoint: analyze code and return DSA analysis report
   */
  @Post('analyze')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Analyze DSA code' })
  @ApiResponse({
    status: 200,
    description: 'Analysis result',
    schema: {
      example: {
        id: 'clx...',
        language: 'C++',
        approach: 'Two Pointer',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        optimization: 'Optimized',
        confidence: 0.85,
        analyzedAt: '2024-01-01T00:00:00.000Z',
        details: {
          loopDepth: 1,
          hasRecursion: false,
          dataStructures: [],
          patterns: ['Single loop over input → linear time'],
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async analyze(@Body() dto: AnalyzeDto) {
    return this.analysisService.analyze(dto);
  }

  /**
   * GET /history
   * Retrieve past analyses (paginated)
   */
  @Get('history')
  @ApiOperation({ summary: 'Get analysis history' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'offset', required: false, type: Number, example: 0 })
  async getHistory(
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number
  ) {
    return this.analysisService.getHistory(limit, offset);
  }

  /**
   * GET /stats
   * Aggregate stats
   */
  @Get('stats')
  @ApiOperation({ summary: 'Get analysis statistics' })
  async getStats() {
    return this.analysisService.getStats();
  }
}
