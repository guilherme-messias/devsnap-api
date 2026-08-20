import {
  Controller,
  Delete,
  HttpCode,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { DeleteEpisodeByIdService } from '../services/delete-episode-by-id.service';
import z from 'zod';
import { ZodValidationPipe } from '../../pipes/ZodValidationPipe';

const idParamSchema = z.uuid();

const paramValidationPipe = new ZodValidationPipe(idParamSchema);
type IdParam = z.infer<typeof idParamSchema>;

@Controller('/episodes')
export class DeleteEpisodeByIdController {
  constructor(
    private readonly deleteEpisodeByIdService: DeleteEpisodeByIdService,
  ) {}

  @Delete(':id')
  @HttpCode(204)
  async deleteEpisodeById(@Param('id', paramValidationPipe) id: IdParam) {
    const deletedEpisode =
      await this.deleteEpisodeByIdService.deleteEpisodeById(id);

    if (!deletedEpisode) {
      throw new NotFoundException(`Episode with ID ${id} not found`);
    }

    return;
  }
}
