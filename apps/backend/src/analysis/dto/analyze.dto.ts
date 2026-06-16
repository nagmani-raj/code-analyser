import { IsString, IsIn, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { Language, Platform } from '@dsa-analyzer/shared';
import { SUPPORTED_LANGUAGES } from '@dsa-analyzer/shared';

export class AnalyzeDto {
  @ApiProperty({ description: 'Source code to analyze', example: 'int main() { return 0; }' })
  @IsString()
  @MinLength(10, { message: 'Code must be at least 10 characters long' })
  @MaxLength(50000, { message: 'Code exceeds 50,000 character limit' })
  code!: string;

  @ApiPropertyOptional({
    description: 'Programming language (auto-detected if omitted)',
    enum: SUPPORTED_LANGUAGES,
    example: 'cpp',
  })
  @IsOptional()
  @IsIn([...SUPPORTED_LANGUAGES, 'unknown'])
  language?: Language;

  @ApiPropertyOptional({
    description: 'Source platform',
    enum: ['leetcode', 'geeksforgeeks', 'hackerrank', 'codeforces', 'unknown'],
  })
  @IsOptional()
  @IsString()
  platform?: Platform;
}
