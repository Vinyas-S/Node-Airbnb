import ioredis, {Redis} from 'ioredis';
import redlock from 'redlock';
import { serverConfig } from '.';

//export const redisClient = new ioredis(serverConfig.REDIS_SERVER_URL);

export function connectToRedis(){
    try {
        let connection:Redis;
       
        return () => {
            if(!connection){
                connection = new ioredis(serverConfig.REDIS_SERVER_URL);
                return connection;
            }
            return connection;
        }

        
    } catch (error) {
        console.log("Error connecting to Redis:", error);
        throw error;
    }
}


export const getRedisConnObj = connectToRedis();

export const redLock = new redlock([getRedisConnObj()],{
    driftFactor: 0.01,
    retryCount:  10,
    retryDelay:  200,
    retryJitter:  200
})
