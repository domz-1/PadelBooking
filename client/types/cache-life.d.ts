declare module "cache-life" {
  export interface CacheLifeOptions {
    maxAge?: number;
    staleWhileRevalidate?: number;
  }

  export function cacheLife(options: CacheLifeOptions): string;
  export const SHORT: string;
  export const MEDIUM: string;
  export const LONG: string;
  export const INFINITE: string;
}
