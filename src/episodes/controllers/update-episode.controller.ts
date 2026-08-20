import {
  Controller,
  HttpCode,
  Put,
  UsePipes,
  Body,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { UpdateEpisodeService } from '../services/update-episode.service';
import { ZodValidationPipe } from '../../pipes/ZodValidationPipe';
import {
  type UpdateEpisodeRequest,
  updateEpisodeSchema,
} from './schemas/episode.type';

@Controller('/episodes')
export class UpdateEpisodeController {
  constructor(private readonly updateEpisodeService: UpdateEpisodeService) {}

  @Put(':id')
  @HttpCode(200)
  @UsePipes(new ZodValidationPipe(updateEpisodeSchema))
  async updateEpisode(
    @Param('id') id: string,
    @Body() body: UpdateEpisodeRequest,
  ) {
    const { title, stack, error, solution } = body;

    const updatedEpisode = await this.updateEpisodeService.updateEpisode(id, {
      title,
      stack,
      error,
      solution,
    });

    if (!updatedEpisode) {
      throw new NotFoundException(`Episode with ID ${id} not found`);
    }

    return { episode: updatedEpisode };
  }
}
