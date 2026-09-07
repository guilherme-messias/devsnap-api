import {
  Controller,
  Get,
  HttpCode,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ZodValidationPipe } from '@shared/pipes/ZodValidationPipe';
import { ValidationErrorResponseDto } from '@http/schemas/response/validation-error.response.schema';
import { JwtUnauthorizedErrorResponseDto } from '@http/schemas/response/jwt-unauthorized-error.response.schema';
import { FetchFocusSessionsHistoryService } from '../services/fetch-focus-sessions-history.service';
import { FetchFocusSessionsHistoryResponseDto } from '../schemas/response/fetch-focus-sessions-history.response.schema';
import {
  pageQueryParamsSchema,
  type PageQueryParams,
} from '@http/schemas/request/page-query.schema';
import type { RequestWithUser } from '@http/types/request-with-user';

const queryValidationPipe = new ZodValidationPipe(pageQueryParamsSchema);

@ApiTags('focus-sessions')
@Controller('/focus-sessions')
@UseGuards(AuthGuard('jwt'))
export class FetchFocusSessionsHistoryController {
  constructor(
    private readonly fetchFocusSessionsHistoryService: FetchFocusSessionsHistoryService,
  ) {}

  @Get('history')
  @HttpCode(200)
  @ApiOperation({ summary: 'Fetch finished focus sessions history' })
  @ApiBearerAuth()
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
  @ApiResponse({
    status: 401,
    description: 'Missing, invalid, or expired token',
    type: JwtUnauthorizedErrorResponseDto,
  })
  async fetchFocusSessionsHistory(
    @Query('page', queryValidationPipe) page: PageQueryParams,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.sub;

    const perPage = 20;

    const focusSessions =
      await this.fetchFocusSessionsHistoryService.fetchFocusSessionsHistory(
        {
          page,
          perPage,
        },
        userId,
      );

    return { focusSessions };
  }
}
