import redisClient from "@/databases/redis.js";
import {
    RedisDeleteDto,
    RedisGetDto,
    RedisSetAddDto,
    RedisSetDto,
    RedisZSetDeleteMembersDto,
    RedisZSetGetScoreDto,
    RedisZSetIncreaseDto,
    RedisZSetRangeDto
} from "@/types/dto/index.js";

interface RedisServiceInterface {
    set: (
        data: RedisSetDto,
        options?: { EX: number }
    ) => Promise<string | null>;
    get: (data: RedisGetDto) => Promise<string | null>;
    delete: (data: RedisDeleteDto) => Promise<number>;
    setAdd: (data: RedisSetAddDto, options?: { EX: number }) => Promise<number>;
    zSetIncrease: (
        data: RedisZSetIncreaseDto,
        options?: { EX: number }
    ) => Promise<number>;
    zSetGetScore: (data: RedisZSetGetScoreDto) => Promise<number | null>;
    zSetDeleteMember: (data: RedisZSetDeleteMembersDto) => Promise<number>;
    zSetRange: (data: RedisZSetRangeDto) => Promise<string[]>;
    zSetRangeRev: (data: RedisZSetRangeDto) => Promise<string[]>;
    getSetMembers: (data: RedisGetDto) => Promise<string[]>;
    isExist: (data: RedisGetDto) => Promise<boolean>;
    setExpire: (data: RedisGetDto, ttl: number) => Promise<boolean>;
}
export const redisService: RedisServiceInterface = {
    isExist: async (data: RedisGetDto) => {
        const { namespace, key } = data;
        return (await redisClient.exists(namespace + ":" + key)) === 1;
    },

    set: async (data: RedisSetDto, options?: { EX: number }) => {
        const { namespace, key, value } = data;
        return await redisClient.set(namespace + ":" + key, value, options);
    },

    get: async (data: RedisGetDto) => {
        const { namespace, key } = data;
        return await redisClient.get(namespace + ":" + key);
    },

    delete: async (data: RedisDeleteDto) => {
        const { namespace, keys } = data;
        return await redisClient.del(keys.map((key) => namespace + ":" + key));
    },

    setAdd: async (data: RedisSetAddDto, options?: { EX: number }) => {
        const { namespace, key, members } = data;
        const result = await redisClient.sAdd(namespace + ":" + key, members);
        if (options?.EX) {
            await redisClient.expire(namespace + ":" + key, options.EX);
        }
        return result;
    },

    zSetIncrease: async (
        data: RedisZSetIncreaseDto,
        options?: { EX: number }
    ) => {
        const { namespace, key, member, value } = data;
        const result = await redisClient.zIncrBy(
            namespace + ":" + key,
            value,
            member
        );
        if (options?.EX) {
            await redisClient.expire(namespace + ":" + key, options.EX);
        }
        return result;
    },

    zSetGetScore: async (data: RedisZSetGetScoreDto) => {
        const { namespace, key, member } = data;
        return await redisClient.zScore(namespace + ":" + key, member);
    },

    zSetRange: async (data: RedisZSetRangeDto) => {
        const { namespace, key, start, end } = data;
        return redisClient.zRange(namespace + ":" + key, start, end);
    },
    zSetRangeRev: async (data: RedisZSetRangeDto) => {
        const { namespace, key, start, end } = data;
        return redisClient.zRange(namespace + ":" + key, start, end, {
            REV: true
        });
    },

    zSetDeleteMember: async (data: RedisZSetDeleteMembersDto) => {
        const { namespace, key, members } = data;
        return await redisClient.zRem(namespace + ":" + key, members);
    },

    getSetMembers: async (data: RedisGetDto) => {
        const { namespace, key } = data;
        return redisClient.sMembers(namespace + ":" + key);
    },

    setExpire: async (data: RedisGetDto, ttl: number) => {
        const { namespace, key } = data;

        return redisClient.expire(namespace + ":" + key, ttl);
    }
};
