import { Redis } from "ioredis";
import { errorLogger as logger } from "./error.logger.js";
let redisWorkerConnection: Redis | null = null;
let redisApiConnection: Redis | null = null;

const baseOptions = {
  keepAlive: 30000,        
  enableReadyCheck: false, 
  maxRetriesPerRequest: null
};

export function redisWorker(): Redis {
  if (redisWorkerConnection) {
    return redisWorkerConnection;
  }
  redisWorkerConnection = new Redis(process.env.REDIS_URL!, {
    ...baseOptions,
    enableOfflineQueue: true,   
  });
  attachLifecycleLogger(redisWorkerConnection, "REDIS_WORKER");
  return redisWorkerConnection;
}

export function redisApi(): Redis {
  if (redisApiConnection) {
    return redisApiConnection;
  }

  redisApiConnection = new Redis(process.env.REDIS_URL!, {
    ...baseOptions,   
    enableOfflineQueue: false,  
  });

  attachLifecycleLogger(redisApiConnection, "REDIS_API");
  return redisApiConnection;
}

export async function shutdownRedises(): Promise<void> {
  logger.info("Initiating graceful teardown of Redis connections...");
  const closures: Promise<string>[] = [];

  if (redisApiConnection) {
    closures.push(redisApiConnection.quit());
  }
  if (redisWorkerConnection) {
    closures.push(redisWorkerConnection.quit());
  }
  await Promise.all(closures);
  redisApiConnection = null;
  redisWorkerConnection = null;
  logger.info("Redis connections successfully severed.");
}


function attachLifecycleLogger(client: Redis, connectionName: string): void {
  client.on("connect", () => {
    logger.info(`[${connectionName}] TCP socket established. Authenticating...`);
  });

  client.on("ready", () => {
    logger.info(`[${connectionName}] Ready for database operations.`);
  });

  client.on("error", (error: Error) => {
    logger.error(`[${connectionName}] Network connection failure`, { 
      errorMessage: error.message,
      stack: error.stack 
    });
  });

  client.on("close", () => {
    logger.warn(`[${connectionName}] Network socket closed.`);
  });

  client.on("reconnecting", (delay: number) => {
    logger.info(`[${connectionName}] Re-establishing connection. Retrying in ${delay}ms...`);
  });
}
