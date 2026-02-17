import * as Sentry from '@sentry/react';

function detectEnvironment(): string {
  const siteUrl = import.meta.env.VITE_SITE_URL as string | undefined;
  if (!siteUrl) return import.meta.env.MODE;
  if (siteUrl.includes('staging')) return 'staging';
  if (siteUrl.includes('localhost') || siteUrl.includes('127.0.0.1')) return 'development';
  return 'production';
}

export function initSentry(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;
  if (!dsn) return;
  Sentry.init({
    dsn,
    environment: detectEnvironment(),
  });
}

export { Sentry };
