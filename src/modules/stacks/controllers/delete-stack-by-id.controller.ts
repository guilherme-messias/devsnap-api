import {
  Controller,
  Delete,
  HttpCode,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import z from 'zod';
import { EpisodeNotFoundErrorResponseDto } from '@shared/http/schemas/response/episode-not-found-error.response.schema';
import { ValidationErrorResponseDto } from '@shared/http/schemas/response/validation-error.response.schema';
import { ZodValidationPipe } from '@shared/pipes/ZodValidationPipe';
import { DeleteStackByIdService } from '../services/delete-stack-by-id.service';

const idParamSchema = z.uuid();

const paramValidationPipe = new ZodValidationPipe(idParamSchema);
type IdParam = z.infer<typeof idParamSchema>;

@ApiTags('stacks')
@Controller('/stacks')
export class DeleteStackByIdController {
  constructor(
    private readonly deleteStackByIdService: DeleteStackByIdService,
  ) {}

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Delete a stack by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Stack ID',
    required: true,
    format: 'uuid',
  })
  @ApiResponse({
    status: 204,
    description: 'The stack has been successfully deleted.',
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
  async deleteStackById(@Param('id', paramValidationPipe) id: IdParam) {
    const deletedStack = await this.deleteStackByIdService.deleteStackById(id);

    if (!deletedStack) {
      throw new NotFoundException(`Stack with ID ${id} not found`);
    }

    return;
  }
}
