type ResponseLike = {
  body: unknown;
};

type E2eEntity = {
  id?: string;
  name?: string;
  title?: string;
  text?: string;
  email?: string;
  message?: string;
  statusCode?: number;
  episodeId?: string;
  stackId?: string;
  error?: string;
  solution?: string;
  result?: string;
  status?: string;
  currentIndex?: number;
  position?: string | number;
  startedAt?: string;
  reviewAt?: string;
  accessToken?: string;
  refreshToken: string;
  avatarUrl?: string | null;
  role?: string | null;
  createdAt?: string;
  updatedAt?: string;
  stack: E2eEntity;
  annotation: E2eEntity;
  episode: E2eEntity;
  annotations: E2eEntity[];
  episodes: E2eEntity[];
  stacks: E2eEntity[];
  episodeReviews: E2eEntity[];
  focusSessions: E2eEntity[];
  items: E2eEntity[];
  totals: {
    stacks?: number;
    episodes?: number;
    pending?: number;
    reviewed?: number;
    overdue?: number;
  };
};

export type E2eBody = E2eEntity;

export const bodyOf = <T extends E2eBody = E2eBody>(
  response: ResponseLike,
): T => response.body as T;
