import { envConfig } from "@/configs/index.js";
import {
    musicsBucketConfigs,
    usersBucketConfigs
} from "@/configs/storage.config.js";
import { storageService } from "@/services/index.js";
import { UserDto, UserProfileDto } from "@/types/dto/user.dto.js";
import {
    FullyNestedAlbum,
    FullyNestedSong,
    FullyNestedUser,
    OptionalRelationsDeep
} from "@/types/models.js";
import { omitPropsFromObject } from "./object.js";
import { AlbumDto, SongDto } from "@/types/dto/index.js";
import { cacheOrFetch } from "./caching.js";
import { namespaces } from "@/configs/redis.config.js";

export const userModelToDto = async (
    user: OptionalRelationsDeep<FullyNestedUser>
): Promise<UserDto> => {
    let userProfile: UserProfileDto | undefined = undefined;
    if (user.userProfile) {
        let avatarImageUrl: string | null = null;
        if (user.userProfile.avatarImagePath) {
            avatarImageUrl = (
                await cacheOrFetch(
                    namespaces.Filepath,
                    `${usersBucketConfigs.name}:${user.userProfile.avatarImagePath}`,
                    () =>
                        storageService.generateUrl(
                            usersBucketConfigs.name,
                            user.userProfile!.avatarImagePath!,
                            envConfig.IMAGE_URL_EXP
                        )
                )
            ).data;
        }
        userProfile = {
            ...omitPropsFromObject(user.userProfile, "avatarImagePath"),
            avatarImageUrl
        };
    }

    return {
        ...omitPropsFromObject(user, ["userProfile", "password"]),
        userProfile
    };
};

export const songModelToDto = async (
    song: OptionalRelationsDeep<FullyNestedSong>
): Promise<SongDto> => {
    let user: UserDto | undefined;
    if (song.user) {
        user = await userModelToDto(song.user);
    }

    const coverImageUrl: string | null = (
        await cacheOrFetch(
            namespaces.Filepath,
            `${musicsBucketConfigs.name}:${song.coverImagePath}`,
            () =>
                storageService.generateUrl(
                    musicsBucketConfigs.name,
                    song.coverImagePath,
                    envConfig.IMAGE_URL_EXP
                )
        )
    ).data;

    return {
        ...omitPropsFromObject(song, [
            "albumOrder",
            "audioFilePath",
            "coverImagePath",
            "user"
        ]),
        user,
        coverImageUrl
    };
};

export const albumModelToDto = async (
    album: OptionalRelationsDeep<FullyNestedAlbum>
): Promise<AlbumDto> => {
    let user: UserDto | undefined;
    if (album.user) {
        user = await userModelToDto(album.user);
    }
    let songs: SongDto[] | undefined = undefined;
    if (album.songs) {
        songs = (
            await Promise.allSettled(
                album.songs.map((song) => songModelToDto(song))
            )
        )
            .filter((result) => result.status == "fulfilled")
            .map((result) => result.value);
    }
    const coverImageUrl: string | null = (
        await cacheOrFetch(
            namespaces.Filepath,
            `${musicsBucketConfigs.name}:${album.coverImagePath}`,
            () =>
                storageService.generateUrl(
                    musicsBucketConfigs.name,
                    album.coverImagePath,
                    envConfig.IMAGE_URL_EXP
                )
        )
    ).data;
    return {
        ...omitPropsFromObject(album, ["coverImagePath", "songs", "user"]),
        user,
        songs,
        coverImageUrl
    };
};
