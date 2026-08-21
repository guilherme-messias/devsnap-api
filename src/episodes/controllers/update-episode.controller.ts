import {
  Controller,
  HttpCode,
  Put,
  Body,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { UpdateEpisodeService } from '../services/update-episode.service';
import { ZodValidationPipe } from '../../pipes/ZodValidationPipe';
import z from 'zod';
import {
  updateEpisodeSchema,
  type UpdateEpisodeRequest,
} from './schemas/request/update-episode.request.schema';

const idParamSchema = z.uuid();
type IdParam = z.infer<typeof idParamSchema>;

@Controller('/episodes')
export class UpdateEpisodeController {
  constructor(private readonly updateEpisodeService: UpdateEpisodeService) {}

  @Put(':id')
  @HttpCode(200)
  async updateEpisode(
    @Param('id', new ZodValidationPipe(idParamSchema)) id: IdParam,
    @Body(new ZodValidationPipe(updateEpisodeSchema))
    body: UpdateEpisodeRequest,
  ) {
    const updatedEpisode = await this.updateEpisodeService.updateEpisode(
      id,
      body,
    );

    if (!updatedEpisode) {
      throw new NotFoundException(`Episode with ID ${id} not found`);
    }

    return { episode: updatedEpisode };
  }
}
