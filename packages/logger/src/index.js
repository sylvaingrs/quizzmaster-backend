import pino from "pino"

/**
 * @param { string } serviceName
 * @returns {import('pino').Logger}
 */
export function createLogger(serviceName) {
    return pino({
        level: 'debug',
        base: {
            service: serviceName,
        },
        timestamp: pino.stdTimeFunctions.isoTime,
        transport: process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: {
                    colorize:      true,
                    translateTime: 'SYS:standard',
                    ignore:        'pid,hostname',
                },
            }
            : undefined,
    });
}

/**
 * @param {string} serviceName
 */
export function createFastifyLoggerConfig(serviceName) {
    return {
        level: 'debug',
        base: {
            service: serviceName,
        },
        timestamp: pino.stdTimeFunctions.isoTime,
        serializers: {
            req(req) {
                return {
                    method:    req.method,
                    url:       req.url,
                    requestId: req.id,
                    traceId:   req.headers['x-trace-id'] ?? req.id,
                };
            },
            res(res) {
                return {
                    statusCode: res.statusCode,
                };
            },
        },
        transport: process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: {
                    colorize:      true,
                    translateTime: 'SYS:standard',
                    ignore:        'pid,hostname',
                },
            }
            : undefined,
    };
}