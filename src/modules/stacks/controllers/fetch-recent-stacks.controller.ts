import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ZodValidationPipe } from '@shared/pipes/ZodValidationPipe';
import {
  Controller,
  Get,
  HttpCode,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ValidationErrorResponseDto } from '@shared/http/schemas/response/validation-error.response.schema';
import { JwtUnauthorizedErrorResponseDto } from '@shared/http/schemas/response/jwt-unauthorized-error.response.schema';
import { FetchRecentStacksService } from '../services/fetch-recent-stacks.service';
import { FetchRecentStacksResponseDto } from '../schemas/response/fetch-recent-stacks.response.schema';
import {
  pageQueryParamsSchema,
  type PageQueryParams,
} from '@shared/http/schemas/request/page-query.schema';
import type { RequestWithUser } from '@shared/http/types/request-with-user';

const queryValidationPipe = new ZodValidationPipe(pageQueryParamsSchema);

@ApiTags('stacks')
@Controller('/stacks')
@UseGuards(AuthGuard('jwt'))
export class FetchRecentStacksController {
  constructor(
    private readonly fetchRecentStacksService: FetchRecentStacksService,
  ) {}

  @Get()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Fetch recent stacks',
  })
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
      'Returns recent stacks. The stacks array is empty when no stacks are found.',
    type: FetchRecentStacksResponseDto,
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
  async fetchRecentStacks(
    @Query('page', queryValidationPipe) page: PageQueryParams,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.sub;

    const perPage = 1;

    const stacks = await this.fetchRecentStacksService.fetchRecentStacks(
      {
        page,
        perPage,
      },
      userId,
    );

    return { stacks };
  }
}
