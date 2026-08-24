import { Controller, Get, HttpCode, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { NotFoundErrorResponseDto } from '@src/shared/http/schemas/response/not-found-error.response.schema';
import { ValidationErrorResponseDto } from '@src/shared/http/schemas/response/validation-error.response.schema';
import { ZodValidationPipe } from '@src/shared/pipes/ZodValidationPipe';
import { Query } from 'pg';
import z from 'zod';
import { FetchRecentAnnotationsService } from '../services/fetch-recent-annotations.service';

const pageQueryParamsSchema = z
  .string()
  .optional()
  .default('1')
  .transform(Number)
  .pipe(z.number().int().min(1));

const queryValidationPipe = new ZodValidationPipe(pageQueryParamsSchema);
type PageQueryParams = z.infer<typeof pageQueryParamsSchema>;

const episodeIdSchema = z.uuid();
type EpisodeId = z.infer<typeof episodeIdSchema>;

@ApiTags('annotations')
@Controller('/episodes')
export class FetchRecentAnnotationsController {
  constructor(
    private readonly fetchRecentAnnotationsService: FetchRecentAnnotationsService,
  ) {}

  @Get(':episodeId/annotations')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Fetch recent annotations',
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
      'Returns recent annotations. The annotations array is empty when no annotations are found.',
    type: FetchRecentAnnotationsResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Episode not found',
    type: NotFoundErrorResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid page parameter',
    type: ValidationErrorResponseDto,
  })
  async fetchRecentAnnotations(
    //TODO: entender erro de tipagem
    @Query('page', new ZodValidationPipe(pageQueryParamsSchema))
    page: PageQueryParams,
    @Param('episodeId', new ZodValidationPipe(episodeIdSchema))
    episodeId: EpisodeId,
  ) {
    const perPage = 1;

    const annotations =
      await this.fetchRecentAnnotationsService.fetchRecentAnnotations(
        {
          page,
          perPage,
        },
        episodeId,
      );

    return { annotations };
  }
}
