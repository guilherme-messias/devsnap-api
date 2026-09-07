import { Controller, Get, HttpCode, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ZodValidationPipe } from '@src/shared/pipes/ZodValidationPipe';
import { ValidationErrorResponseDto } from '@src/shared/http/schemas/response/validation-error.response.schema';
import { FetchFocusSessionsHistoryService } from '../services/fetch-focus-sessions-history.service';
import { FetchFocusSessionsHistoryResponseDto } from '../schemas/response/fetch-focus-sessions-history.response.schema';
import {
  pageQueryParamsSchema,
  type PageQueryParams,
} from '@src/shared/http/schemas/request/page-query.schema';

const queryValidationPipe = new ZodValidationPipe(pageQueryParamsSchema);

@ApiTags('focus-sessions')
@Controller('/focus-sessions')
export class FetchFocusSessionsHistoryController {
  constructor(
    private readonly fetchFocusSessionsHistoryService: FetchFocusSessionsHistoryService,
  ) {}

  @Get('history')
  @HttpCode(200)
  @ApiOperation({ summary: 'Fetch finished focus sessions history' })
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
      'Returns finished focus sessions. The focusSessions array is empty when none are found.',
    type: FetchFocusSessionsHistoryResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid page parameter',
    type: ValidationErrorResponseDto,
  })
  async fetchFocusSessionsHistory(
    @Query('page', queryValidationPipe) page: PageQueryParams,
  ) {
    const perPage = 20;

    const focusSessions =
      await this.fetchFocusSessionsHistoryService.fetchFocusSessionsHistory({
        page,
        perPage,
      });

    return { focusSessions };
  }
}
