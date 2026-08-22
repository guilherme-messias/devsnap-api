import { Body, Controller, HttpCode, Post, UsePipes } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateStackService } from '../services/create-stack.service';
import { CreateStackResponseDto } from './schemas/response/create-stack.response.schema';
import { ValidationErrorResponseDto } from '../../http/schemas/response/validation-error.response.schema';
import {
  createStackSchema,
  CreateStackDto,
} from './schemas/request/create-stack.request';
import { ZodValidationPipe } from '../../pipes/ZodValidationPipe';

@ApiTags('stacks')
@Controller('/stacks')
export class CreateStackController {
  constructor(private readonly createStackService: CreateStackService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a new stack' })
  @ApiResponse({
    status: 201,
    description: 'The stack has been successfully created.',
    type: CreateStackResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request body',
    type: ValidationErrorResponseDto,
  })
  @UsePipes(new ZodValidationPipe(createStackSchema))
  async createStack(@Body() body: CreateStackDto) {
    const { name } = body;
    return this.createStackService.createStack({ name });
  }
}
