import {
  Controller,
  Delete,
  HttpCode,
  Param,
  NotFoundException,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { StackNotFoundErrorResponseDto } from '@http/schemas/response/stack-not-found-error.response.schema';
import { ValidationErrorResponseDto } from '@shared/http/schemas/response/validation-error.response.schema';
import { JwtUnauthorizedErrorResponseDto } from '@shared/http/schemas/response/jwt-unauthorized-error.response.schema';
import { ZodValidationPipe } from '@shared/pipes/ZodValidationPipe';
import { DeleteStackByIdService } from '../services/delete-stack-by-id.service';
import {
  uuidParamSchema,
  type UuidParam,
} from '@http/schemas/request/uuid-param.schema';
import type { RequestWithUser } from '@shared/http/types/request-with-user';

const paramValidationPipe = new ZodValidationPipe(uuidParamSchema);
@ApiTags('stacks')
@Controller('/stacks')
@UseGuards(AuthGuard('jwt'))
export class DeleteStackByIdController {
  constructor(
    private readonly deleteStackByIdService: DeleteStackByIdService,
  ) {}

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Delete a stack by ID',
  })
  @ApiBearerAuth()
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
    status: 401,
    description: 'Missing, invalid, or expired token',
    type: JwtUnauthorizedErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Stack not found',
    type: StackNotFoundErrorResponseDto,
  })
  async deleteStackById(
    @Param('id', paramValidationPipe) id: UuidParam,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.sub;

    const deletedStack = await this.deleteStackByIdService.deleteStackById(
      id,
      userId,
    );

    if (!deletedStack) {
      throw new NotFoundException(`Stack with ID ${id} not found`);
    }

    return;
  }
}
