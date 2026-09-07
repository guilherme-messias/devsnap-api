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
  Patch,
  HttpCode,
  Param,
  Body,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StackNotFoundErrorResponseDto } from '@src/shared/http/schemas/response/stack-not-found-error.response.schema';
import { ValidationErrorResponseDto } from '@shared/http/schemas/response/validation-error.response.schema';
import { JwtUnauthorizedErrorResponseDto } from '@shared/http/schemas/response/jwt-unauthorized-error.response.schema';
import { UpdateStackService } from '../services/update-stack.service';
import {
  updateStackSchema,
  UpdateStackDto,
} from '../schemas/request/update-stack.request.schema';
import { UpdateStackResponseDto } from '../schemas/response/update-stack.response.schema';
import {
  uuidParamSchema,
  type UuidParam,
} from '@src/shared/http/schemas/request/uuid-param.schema';
import { CurrentUserId } from '@shared/http/decorators/current-user-id.decorator';

@ApiTags('stacks')
@Controller('/stacks')
@UseGuards(AuthGuard('jwt'))
export class UpdateStackController {
  constructor(private readonly updateStackService: UpdateStackService) {}

  @Patch(':id')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Update an existing stack',
  })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'The ID of the stack to update',
    required: true,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'The stack has been successfully updated.',
    type: UpdateStackResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request body or ID parameter',
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
  async updateStack(
    @Param('id', new ZodValidationPipe(uuidParamSchema)) id: UuidParam,
    @Body(new ZodValidationPipe(updateStackSchema))
    body: UpdateStackDto,
    @CurrentUserId() userId: string,
  ) {
    const updatedStack = await this.updateStackService.updateStack(
      id,
      body,
      userId,
    );

    if (!updatedStack) {
      throw new NotFoundException(`Stack with ID ${id} not found`);
    }

    return { stack: updatedStack };
  }
}
