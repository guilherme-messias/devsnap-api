import { Controller, Get, HttpCode } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetDashboardService } from '../services/get-dashboard.service';
import { GetDashboardResponseDto } from './schemas/response/get-dashboard.response.schema';

@ApiTags('dashboard')
@Controller('/dashboard')
export class GetDashboardController {
  constructor(private readonly getDashboardService: GetDashboardService) {}

  @Get()
  @HttpCode(200)
  @ApiOperation({ summary: 'Get dashboard totals and stack progress' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard totals and per-stack progress',
    type: GetDashboardResponseDto,
  })
  async getDashboard() {
    return this.getDashboardService.getDashboard();
  }
}
