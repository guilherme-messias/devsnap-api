import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ZodValidationPipe } from '@shared/pipes/ZodValidationPipe';
import {
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { FetchStackResponseDto } from '../schemas/response/fetch-stack.response.schema';
import { EpisodeNotFoundErrorResponseDto } from '@src/shared/http/schemas/response/episode-not-found-error.response.schema';
import { ValidationErrorResponseDto } from '@shared/http/schemas/response/validation-error.response.schema';
import { FetchStackByIdService } from '../services/fetch-stack-by-id.service';
import {
  uuidParamSchema,
  type UuidParam,
} from '@src/shared/http/schemas/request/uuid-param.schema';

const paramValidationPipe = new ZodValidationPipe(uuidParamSchema);
@ApiTags('stacks')
@Controller('/stacks')
export class FetchStackByIdController {
  constructor(private readonly fetchStackByIdService: FetchStackByIdService) {}

  @Get(':id')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Fetch a stack by ID',
  })
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
    status: 404,
    description: 'Stack not found',
    type: EpisodeNotFoundErrorResponseDto,
  })
  async fetchStackById(@Param('id', paramValidationPipe) id: UuidParam) {
    const stack = await this.fetchStackByIdService.fetchStackById(id);

    if (!stack) {
      throw new NotFoundException(`Stack with ID ${id} not found`);
    }

    return { stack };
  }
}
