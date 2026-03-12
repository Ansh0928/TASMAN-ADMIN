import * as Sentry from '@sentry/nextjs';

export function captureError(error: unknown, context?: string) {
  console.error(context, error);
  Sentry.captureException(error, context ? { tags: { context } } : undefined);
}
