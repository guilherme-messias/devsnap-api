import {
  Controller,
  NotFoundException,
  Param,
  ParseBoolPipe,
  Patch,
} from '@nestjs/common';
import { MarkEpisodeAsReviewedService } from '../services/mark-episode-as-reviewed.service';

@Controller('/episodes')
export class MarkEpisodeAsReviewedController {
  constructor(
    private readonly markEpisodeAsReviewedService: MarkEpisodeAsReviewedService,
  ) {}

  @Patch(':id/reviewed/:reviewed')
  async markEpisodeAsReviewed(
    @Param('id') id: string,
    @Param('reviewed', ParseBoolPipe) reviewed: boolean,
  ) {
    const updatedEpisode =
      await this.markEpisodeAsReviewedService.markEpisodeAsReviewed(
        id,
        reviewed,
      );

    if (!updatedEpisode) {
      throw new NotFoundException(`Episode with ID ${id} not found`);
    }

    return { episode: updatedEpisode };
  }
}
