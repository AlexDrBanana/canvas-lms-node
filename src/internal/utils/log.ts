export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'off';

export interface Logger {
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  off: 4,
};

export function shouldLog(configuredLevel: LogLevel, messageLevel: LogLevel): boolean {
  return LOG_LEVELS[messageLevel] >= LOG_LEVELS[configuredLevel];
}

export function parseLogLevel(
  value: string | undefined,
  source: string,
  logger: Logger,
): LogLevel | undefined {
  if (!value) return undefined;
  const lower = value.toLowerCase();
  if (lower in LOG_LEVELS) return lower as LogLevel;
  logger.warn(`Invalid log level "${value}" from ${source}, ignoring.`);
  return undefined;
}

export function loggerFor(
  client: { logger: Logger; logLevel: LogLevel | undefined },
): Logger {
  const level = client.logLevel ?? 'warn';
  const base = client.logger;
  return {
    debug(msg, ...args) {
      if (shouldLog(level, 'debug')) base.debug(msg, ...args);
    },
    info(msg, ...args) {
      if (shouldLog(level, 'info')) base.info(msg, ...args);
    },
    warn(msg, ...args) {
      if (shouldLog(level, 'warn')) base.warn(msg, ...args);
    },
    error(msg, ...args) {
      if (shouldLog(level, 'error')) base.error(msg, ...args);
    },
  };
}
