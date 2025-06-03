import { namespaces } from "@/configs/redis.config.js";
import { redisService } from "@/services/redis.service.js";
import { envConfig } from "@/configs/env.config.js";
import stableStringify from "json-stable-stringify";

export const cacheOrFetch = async <T>(
    namespace: namespaces,
    key: string,
    fetchFn: () => Promise<T>,
    cacheDuration?: number
): Promise<{ data: T; cacheHit: boolean }> => {
    const cached = await redisService.get({ namespace, key });
    if (cached) {
        return { data: JSON.parse(cached) as T, cacheHit: true };
    }

    const data = await fetchFn();
    if (data) {
        redisService.set(
            { namespace, key, value: stableStringify(data)! },
            { EX: cacheDuration ? cacheDuration : envConfig.REDIS_CACHING_EXP }
        );
    }
    return { data, cacheHit: false };
};
