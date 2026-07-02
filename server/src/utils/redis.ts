import {createClient, RedisClientType} from 'redis';
import { errorLogger as logger } from './error.logger.js';
import { ErrorFactory } from '@/errors/app.error.js';
let redisClient :RedisClientType;


export async function connectClient():Promise<RedisClientType>{
  const url = process.env.REDIS_URL;
  if(!url){
    throw ErrorFactory.notFound('REDIS_URL is not available in the process env.')
  }
  redisClient = createClient({url});
  redisClient.on('error', (err)=>{
    logger.error('Redis client error is occured', err);
  });

  redisClient.on('connect', ()=>{
    logger.info('Redis client is connected successfully')
  })
  await redisClient.connect();
  return redisClient;
}

export const getRedisClient = (): RedisClientType => {
  if (!redisClient) {
    throw ErrorFactory.notFound('Redis client not initialized. Call connectRedis() first.');
  }
  return redisClient;
};

export const disconnectRedis = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    logger.info('Redis Client Disconnected');
  }
};
