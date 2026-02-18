import { Sentry } from '../sentry';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_ORDER: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };

const ROOT_LEVEL: LogLevel = import.meta.env.MODE === 'production' ? 'warn' : 'debug';

interface Logger {
  debug: (msg: string, ...args: unknown[]) => void;
  info: (msg: string, ...args: unknown[]) => void;
  warn: (msg: string, ...args: unknown[]) => void;
  error: (msg: string, ...args: unknown[]) => void;
}

function shouldLog(level: LogLevel): boolean {
  return LEVEL_ORDER[level] >= LEVEL_ORDER[ROOT_LEVEL];
}

export function createLogger(component: string): Logger {
  const prefix = `[${component}]`;

  return {
    debug(msg, ...args) {
      // eslint-disable-next-line no-console -- logger is the console wrapper
      if (shouldLog('debug')) console.debug(prefix, msg, ...args);
    },
    info(msg, ...args) {
      if (shouldLog('info')) console.info(prefix, msg, ...args);
    },
    warn(msg, ...args) {
      if (shouldLog('warn')) console.warn(prefix, msg, ...args);
      Sentry.addBreadcrumb({ category: component, message: msg, level: 'warning' });
    },
    error(msg, ...args) {
      if (shouldLog('error')) console.error(prefix, msg, ...args);
      const err = args.find((a) => a instanceof Error);
      if (err) {
        Sentry.captureException(err, { tags: { component } });
      } else {
        Sentry.captureMessage(`${prefix} ${msg}`, { level: 'error', tags: { component } });
      }
    },
  };
}
