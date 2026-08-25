import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ZodValidationPipe } from '@shared/pipes/ZodValidationPipe';
import {
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { FetchStackResponseDto } from './schemas/response/fetch-stack.response.schema';
import z from 'zod';
import { EpisodeNotFoundErrorResponseDto } from '@src/shared/http/schemas/response/episode-not-found-error.response.schema';
import { ValidationErrorResponseDto } from '@shared/http/schemas/response/validation-error.response.schema';
import { FetchStackByIdService } from '../services/fetch-stack-by-id.service';

const idParamSchema = z.uuid();

const paramValidationPipe = new ZodValidationPipe(idParamSchema);
type IdParam = z.infer<typeof idParamSchema>;

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
  async fetchStackById(@Param('id', paramValidationPipe) id: IdParam) {
    const stack = await this.fetchStackByIdService.fetchStackById(id);

    if (!stack) {
      throw new NotFoundException(`Stack with ID ${id} not found`);
    }

    return { stack };
  }
}
