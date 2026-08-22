import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ZodValidationPipe } from '@shared/pipes/ZodValidationPipe';
import { Controller, Get, HttpCode, Query } from '@nestjs/common';
import z from 'zod';
import { ValidationErrorResponseDto } from '@shared/http/schemas/response/validation-error.response.schema';
import { FetchRecentStacksService } from '../services/fetch-recent-stacks.service';
import { FetchRecentStacksResponseDto } from './schemas/response/fetch-recent-stacks.schema';

const pageQueryParamsSchema = z
  .string()
  .optional()
  .default('1')
  .transform(Number)
  .pipe(z.number().int().min(1));

const queryValidationPipe = new ZodValidationPipe(pageQueryParamsSchema);
type PageQueryParams = z.infer<typeof pageQueryParamsSchema>;

@ApiTags('stacks')
@Controller('/stacks')
export class FetchRecentStacksController {
  constructor(
    private readonly fetchRecentStacksService: FetchRecentStacksService,
  ) {}

  @Get()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Fetch recent stacks',
  })
  @ApiQuery({
    name: 'page',
    description: 'Page number for pagination (default: 1)',
    required: false,
    schema: {
      type: 'integer',
      default: 1,
      minimum: 1,
    },
  })
  @ApiResponse({
    status: 200,
    description:
      'Returns recent stacks. The stacks array is empty when no stacks are found.',
    type: FetchRecentStacksResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid page parameter',
    type: ValidationErrorResponseDto,
  })
  async fetchRecentStacks(
    @Query('page', queryValidationPipe) page: PageQueryParams,
  ) {
    const perPage = 1;

    const stacks = await this.fetchRecentStacksService.fetchRecentStacks({
      page,
      perPage,
    });

    return { stacks };
  }
}
