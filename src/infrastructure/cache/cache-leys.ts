export const CacheKeys = {
  dashboard: (userId: string) => `dashboard:${userId}`,
  userProfile: (userId: string) => `user:profile:${userId}`,
} as const;