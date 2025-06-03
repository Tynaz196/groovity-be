import { namespaces } from "@/configs/redis.config.js";

export type RedisSetDto = {
    namespace: namespaces;
    key: string;
    value: string;
};

export type RedisGetDto = {
    namespace: namespaces;
    key: string;
};

export type RedisDeleteDto = {
    namespace: namespaces;
    keys: string[];
};

export type RedisSetAddDto = {
    namespace: string;
    key: string;
    members: string[];
};

export type RedisZSetIncreaseDto = {
    namespace: string;
    key: string;
    member: string;
    value: number;
};

export type RedisZSetGetScoreDto = {
    namespace: string;
    key: string;
    member: string;
};

export type RedisZSetRangeDto = {
    namespace: string;
    key: string;
    start: number;
    end: number;
};

export type RedisZSetDeleteMembersDto = {
    namespace: string;
    key: string;
    members: string[];
};
