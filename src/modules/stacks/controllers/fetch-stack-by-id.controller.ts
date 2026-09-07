import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ZodValidationPipe } from '@shared/pipes/ZodValidationPipe';
import {
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FetchStackResponseDto } from '../schemas/response/fetch-stack.response.schema';
import { StackNotFoundErrorResponseDto } from '@http/schemas/response/stack-not-found-error.response.schema';
import { ValidationErrorResponseDto } from '@shared/http/schemas/response/validation-error.response.schema';
import { JwtUnauthorizedErrorResponseDto } from '@shared/http/schemas/response/jwt-unauthorized-error.response.schema';
import { FetchStackByIdService } from '../services/fetch-stack-by-id.service';
import {
  uuidParamSchema,
  type UuidParam,
} from '@http/schemas/request/uuid-param.schema';
import type { RequestWithUser } from '@shared/http/types/request-with-user';

const paramValidationPipe = new ZodValidationPipe(uuidParamSchema);
@ApiTags('stacks')
@Controller('/stacks')
@UseGuards(AuthGuard('jwt'))
export class FetchStackByIdController {
  constructor(private readonly fetchStackByIdService: FetchStackByIdService) {}

  @Get(':id')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Fetch a stack by ID',
  })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'Stack ID',
    required: true,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'The stack has been successfully fetched.',
    type: FetchStackResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid ID parameter',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Missing, invalid, or expired token',
    type: JwtUnauthorizedErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Stack not found',
    type: StackNotFoundErrorResponseDto,
  })
  async fetchStackById(
    @Param('id', paramValidationPipe) id: UuidParam,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.sub;

    const stack = await this.fetchStackByIdService.fetchStackById(id, userId);

    if (!stack) {
      throw new NotFoundException(`Stack with ID ${id} not found`);
    }

    return { stack };
  }
}
