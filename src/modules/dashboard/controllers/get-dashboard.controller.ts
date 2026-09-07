import { Controller, Get, HttpCode, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { GetDashboardService } from '../services/get-dashboard.service';
import { GetDashboardResponseDto } from '../schemas/response/get-dashboard.response.schema';
import { JwtUnauthorizedErrorResponseDto } from '@http/schemas/response/jwt-unauthorized-error.response.schema';
import type { RequestWithUser } from '@http/types/request-with-user';

@ApiTags('dashboard')
@Controller('/dashboard')
@UseGuards(AuthGuard('jwt'))
export class GetDashboardController {
  constructor(private readonly getDashboardService: GetDashboardService) {}

  @Get()
  @HttpCode(200)
  @ApiOperation({ summary: 'Get dashboard totals and stack progress' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Dashboard totals and per-stack progress',
    type: GetDashboardResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Missing, invalid, or expired token',
    type: JwtUnauthorizedErrorResponseDto,
  })
  async getDashboard(@Req() req: RequestWithUser) {
    const userId = req.user.sub;

    return this.getDashboardService.getDashboard(userId);
  }
}
