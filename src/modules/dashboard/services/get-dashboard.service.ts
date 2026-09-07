import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/infrastructure/prisma/prisma.service';

const OVERDUE_DAYS = 7;

@Injectable()
export class GetDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(userId: string) {
    const stacks = await this.prisma.stack.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        episodes: {
          include: {
            episodeReviews: {
              select: { id: true },
              take: 1,
            },
          },
        },
      },
    });

    const overdueThreshold = new Date(
      Date.now() - OVERDUE_DAYS * 24 * 60 * 60 * 1000,
    );

    let totalEpisodes = 0;
    let totalPending = 0;
    let totalReviewed = 0;
    let totalOverdue = 0;

    const stackSummaries = stacks.map((stack) => {
      let pendingCount = 0;
      let reviewedCount = 0;
      let overdueCount = 0;

      for (const episode of stack.episodes) {
        const isReviewed = episode.episodeReviews.length > 0;

        if (isReviewed) {
          reviewedCount += 1;
        } else {
          pendingCount += 1;
          if (episode.createdAt < overdueThreshold) {
            overdueCount += 1;
          }
        }
      }

      const episodeCount = stack.episodes.length;
      totalEpisodes += episodeCount;
      totalPending += pendingCount;
      totalReviewed += reviewedCount;
      totalOverdue += overdueCount;

      return {
        id: stack.id,
        name: stack.name,
        episodeCount,
        pendingCount,
        reviewedCount,
        overdueCount,
        progressPercentage:
          episodeCount === 0
            ? 0
            : Math.round((reviewedCount / episodeCount) * 10000) / 100,
      };
    });

    return {
      totals: {
        stacks: stacks.length,
        episodes: totalEpisodes,
        pending: totalPending,
        reviewed: totalReviewed,
        overdue: totalOverdue,
      },
      stacks: stackSummaries,
    };
  }
}
