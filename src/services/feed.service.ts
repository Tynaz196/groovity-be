import { songRepo } from "@/repositories/song.repo.js";
import {
    GetMostLikedSongDto,
    GetRecentlyMostLikedSongDto,
    SongDto
} from "@/types/dto/index.js";
import { songModelToDto } from "@/utils/modelToDto.js";
import redisClient from "@/databases/redis.js";
import { namespaces } from "@/configs/redis.config.js";
import { cacheOrFetch } from "@/utils/caching.js";

interface FeedServiceInterface {
    getMostLikedSong: (args: GetMostLikedSongDto) => Promise<SongDto[]>;
    getRecentlyLikedSongs: (
        args: GetRecentlyMostLikedSongDto
    ) => Promise<SongDto[]>;
}

export const feedService: FeedServiceInterface = {
    getMostLikedSong: async (args: GetMostLikedSongDto): Promise<SongDto[]> => {
        const { options } = args;
        const { limit, offset, userProfiles } = options;

        const cacheKey = `mostLikedSong:${options}`;
        const { data: songs } = await cacheOrFetch(
            namespaces.Feed,
            cacheKey,
            () =>
                songRepo.getManyByFilter(
                    {},
                    {
                        take: limit,
                        skip: offset,
                        orderBy: {
                            likesCount: "desc"
                        },
                        include: {
                            user: {
                                include: {
                                    userProfile: userProfiles
                                }
                            }
                        }
                    }
                ),
            5 * 60
        );

        return (
            await Promise.allSettled(songs.map((song) => songModelToDto(song)))
        )
            .filter((result) => result.status == "fulfilled")
            .map((result) => result.value);
    },

    getRecentlyLikedSongs: async (args: GetRecentlyMostLikedSongDto) => {
        const { options } = args;
        const { limit, offset, userProfiles } = options;

        const weights = [1.0, 0.7, 0.4];
        const keys: string[] = [];
        const now = new Date();

        const cacheKey = `recentlyLikedSong:${now.toISOString().slice(0, 10)}:${options}`;
        const { data: songs } = await cacheOrFetch(
            namespaces.Feed,
            cacheKey,
            async () => {
                const allEntries: Record<string, number> = {};

                for (let i = 0; i < 3; i++) {
                    const date = new Date(now);
                    date.setDate(now.getDate() - i);
                    const dateStr = date.toISOString().slice(0, 10);
                    keys.push(`songs:dailyLikes:${dateStr}`);
                }

                for (let i = 0; i < keys.length; i++) {
                    const entries = await redisClient.zRangeWithScores(
                        namespaces.Like + ":" + keys[i],
                        0,
                        50,
                        { REV: true }
                    );
                    for (const { value: songId, score } of entries) {
                        const weightedScore = score * weights[i];
                        allEntries[songId] =
                            (allEntries[songId] ?? 0) + weightedScore;
                    }
                }

                const sorted = Object.entries(allEntries)
                    .sort(([, a], [, b]) => b - a)
                    .slice(offset, offset + limit)
                    .map(([songId]) => songId);

                return await songRepo.getManyByIds(sorted, {
                    include: {
                        user: { include: { userProfile: userProfiles } }
                    }
                });
            },
            5 * 60
        );

        return (
            await Promise.allSettled(songs.map((song) => songModelToDto(song)))
        )
            .filter((result) => result.status == "fulfilled")
            .map((result) => result.value);
    }
};
