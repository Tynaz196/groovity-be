import { Album, Prisma } from "@prisma/client";
import prismaClient from "@/databases/prisma.js";
import { searchAlbums, searchAlbumsWithUserId } from "@prisma/client/sql";
import { omitPropsFromObject } from "@/utils/object.js";

export const albumRepo = {
    create: (
        data: Prisma.AlbumCreateInput,
        options?: Omit<Prisma.AlbumCreateArgs, "data">
    ) => {
        return prismaClient.album.create({
            data,
            ...options
        });
    },

    getOneByFilter: (
        filter: Prisma.AlbumWhereInput,
        options?: Omit<Prisma.AlbumFindFirstArgs, "where">
    ) => {
        return prismaClient.album.findFirst({ where: filter, ...options });
    },

    update: (
        filter: Prisma.AlbumWhereUniqueInput,
        data: Prisma.AlbumUpdateInput,
        options?: Omit<Prisma.AlbumUpdateArgs, "data" | "where">
    ) => {
        return prismaClient.album.update({
            where: filter,
            data,
            ...options
        });
    },

    delete: (
        filter: Prisma.AlbumWhereUniqueInput,
        options?: Omit<Prisma.AlbumDeleteArgs, "where">
    ): Promise<Album> => {
        return prismaClient.album.delete({
            where: filter,
            ...options
        });
    },

    searchAlbums: async (
        filter: { userId?: string; name?: string },
        options?: Omit<Prisma.AlbumFindManyArgs, "where">,
        loginUserId?: string
    ) => {
        const { name = "", userId } = filter;
        const { skip = 0, take = 10 } = options ?? { undefined };
        const sql = userId
            ? searchAlbumsWithUserId(
                  name,
                  take,
                  skip,
                  userId,
                  loginUserId ? loginUserId : ""
              )
            : searchAlbums(name, take, skip, loginUserId ? loginUserId : "");
        const results = await prismaClient.$queryRawTyped(sql);
        const ids = results.map((result) => result.id);

        const albums = await prismaClient.album.findMany({
            where: { id: { in: ids } },
            ...(options ? omitPropsFromObject(options, ["skip", "take"]) : {})
        });

        const idOrderMap = new Map(ids.map((id, index) => [id, index]));
        albums.sort((a, b) => idOrderMap.get(a.id)! - idOrderMap.get(b.id)!);
        return albums;
    },

    connectSongs: async (albumId: string, songIds: string[]) => {
        return await prismaClient.$transaction(async (tx) => {
            const album = await tx.album.update({
                where: {
                    id: albumId
                },
                data: {
                    songs: {
                        updateMany: {
                            where: {},
                            data: {
                                albumOrder: null
                            }
                        },
                        set: songIds.map((id) => {
                            return { id: id };
                        })
                    }
                },
                include: {
                    songs: true
                }
            });
            return {
                ...album,
                songs: await Promise.all(
                    songIds.map((id, index) =>
                        tx.song.update({
                            where: { id },
                            data: { albumOrder: index }
                        })
                    )
                )
            };
        });
    },

    // connectSongs: async (albumId: string, songIds: string[]) => {
    //     return await prismaClient.$transaction(async (tx) => {
    //         const album = await tx.album.update({
    //             where: {
    //                 id: albumId
    //             },
    //             data: {
    //                 songs: {
    //                     updateMany: {
    //                         where: {},
    //                         data: {
    //                             albumOrder: null
    //                         }
    //                     },
    //                     set: songIds.map((id) => {
    //                         return { id: id };
    //                     })
    //                 }
    //             },
    //             include: {
    //                 songs: true
    //             }
    //         });
    //         return {
    //             ...album,
    //             songs: await Promise.all(
    //                 songIds.map((id, index) =>
    //                     tx.song.update({
    //                         where: { id },
    //                         data: { albumOrder: (index + 1) * 10 }
    //                     })
    //                 )
    //             )
    //         };
    //     });
    // },

    addSong: async (
        album: Prisma.AlbumGetPayload<{
            include: { songs: true };
        }>,
        songId: string,
        index?: number
    ) => {
        // songs already sort before pass in this function
        return await prismaClient.$transaction(async (tx) => {
            const songs = album.songs;

            if (songs.length === 0) {
                const song = await tx.song.update({
                    where: { id: songId },
                    data: {
                        albumOrder: 0,
                        album: { connect: { id: album.id } }
                    }
                });
                return { ...album, songs: [song] };
            }

            if (index === undefined || index >= songs.length) {
                const song = await tx.song.update({
                    where: { id: songId },
                    data: {
                        albumOrder: songs[songs.length - 1].albumOrder! + 1,
                        album: { connect: { id: album.id } }
                    }
                });
                return { ...album, songs: [...songs, song] };
            }

            for (let i = songs.length - 1; i >= index; i--) {
                await tx.song.update({
                    where: { id: songs[i].id },
                    data: {
                        albumOrder: songs[i].albumOrder! + 1
                    }
                });
            }

            const insertedSong = await tx.song.update({
                where: { id: songId },
                data: {
                    albumOrder: index,
                    album: { connect: { id: album.id } }
                }
            });

            return {
                ...album,
                songs: [
                    ...songs.slice(0, index),
                    insertedSong,
                    ...songs.slice(index)
                ]
            };
        });
    },

    // addSong: async (
    //     album: Prisma.AlbumGetPayload<{
    //         include: { songs: true };
    //     }>,
    //     songId: string,
    //     index?: number
    // ) => {
    //     return await prismaClient.$transaction(async (tx) => {
    //         const songs = album.songs;
    //         if (songs.length == 0) {
    //             const song = await tx.song.update({
    //                 where: {
    //                     id: songId
    //                 },
    //                 data: {
    //                     albumOrder: 10,
    //                     album: {
    //                         connect: {
    //                             id: album.id
    //                         }
    //                     }
    //                 }
    //             });
    //             return { ...album, songs: [song] };
    //         }
    //         if (index == undefined || index >= songs.length) {
    //             const song = await tx.song.update({
    //                 where: {
    //                     id: songId
    //                 },
    //                 data: {
    //                     albumOrder: songs[songs.length - 1].albumOrder! + 10,
    //                     album: {
    //                         connect: {
    //                             id: album.id
    //                         }
    //                     }
    //                 }
    //             });
    //             return { ...album, songs: [...songs, song] };
    //         }
    //         const prev = index > 0 ? songs[index - 1].albumOrder! : -1;
    //         const next = songs[index].albumOrder!;

    //         // check if there is space for insert
    //         if (next - prev > 1) {
    //             const song = await tx.song.update({
    //                 where: {
    //                     id: songId
    //                 },
    //                 data: {
    //                     albumOrder: (prev + next) / 2,
    //                     album: {
    //                         connect: {
    //                             id: album.id
    //                         }
    //                     }
    //                 }
    //             });
    //             songs.splice(index, 0, song);
    //             return { ...album, songs: songs };
    //         }
    //         // repopulate the sparse list
    //         let start = index - 5 >= 0 ? index - 5 : 0;
    //         let end = index + 5 < songs.length ? index + 5 : songs.length - 1;
    //         while (
    //             songs[end].albumOrder! - songs[start].albumOrder! <
    //                 10 * (end - start + 1) &&
    //             (start != 0 || end != songs.length - 1)
    //         ) {
    //             start = start - 5 >= 0 ? start - 5 : 0;
    //             end = end + 5 < songs.length ? end + 5 : songs.length - 1;
    //         }
    //         const startOrder = start != 0 ? songs[start].albumOrder! : 10;
    //         if (end != songs.length - 1) {
    //             const endOrder = songs[end].albumOrder!;
    //             const step = (endOrder - startOrder) / (end - start);
    //             await Promise.all(
    //                 songs.map((song, index) =>
    //                     tx.song.update({
    //                         where: {
    //                             id: song.id
    //                         },
    //                         data: {
    //                             albumOrder: startOrder + index * step
    //                         }
    //                     })
    //                 )
    //             );
    //             const song = await tx.song.update({
    //                 where: {
    //                     id: songId
    //                 },
    //                 data: {
    //                     albumOrder: startOrder + index * step - step / 2,
    //                     album: {
    //                         connect: {
    //                             id: album.id
    //                         }
    //                     }
    //                 }
    //             });
    //             songs.splice(index, 0, song);
    //             return { ...album, songs };
    //         }
    //         await Promise.all(
    //             songs.map((song, index) =>
    //                 tx.song.update({
    //                     where: {
    //                         id: song.id
    //                     },
    //                     data: {
    //                         albumOrder: startOrder + index * 10
    //                     }
    //                 })
    //             )
    //         );
    //         const song = await tx.song.update({
    //             where: {
    //                 id: songId
    //             },
    //             data: {
    //                 albumOrder: startOrder + index * 10 - 10 / 2,
    //                 album: {
    //                     connect: {
    //                         id: album.id
    //                     }
    //                 }
    //             }
    //         });
    //         songs.splice(index, 0, song);
    //         return { ...album, songs: songs };
    //     });
    // },

    addSongs: async (
        album: Prisma.AlbumGetPayload<{
            include: { songs: true };
        }>,
        songIds: string[]
    ) => {
        // songs already sort before pass in this function
        const songs = album.songs;
        let startIndex = 0;
        if (songs.length != 0) {
            startIndex = songs.length;
        }
        return {
            ...album,
            songs: [
                ...songs,
                ...(await prismaClient.$transaction(
                    songIds.map((id, index) =>
                        prismaClient.song.update({
                            where: { id },
                            data: {
                                albumOrder: startIndex + index,
                                album: {
                                    connect: {
                                        id: album.id
                                    }
                                }
                            }
                        })
                    )
                ))
            ]
        };
    },

    // addSongs: async (
    //     album: Prisma.AlbumGetPayload<{
    //         include: { songs: true };
    //     }>,
    //     songIds: string[]
    // ) => {
    //     const songs = album.songs;
    //     let startIndex = 0;
    //     if (songs.length != 0) {
    //         startIndex = songs[songs.length - 1].albumOrder! + 10;
    //     }
    //     return {
    //         ...album,
    //         songs: [
    //             ...songs,
    //             ...(await prismaClient.$transaction(
    //                 songIds.map((id, index) =>
    //                     prismaClient.song.update({
    //                         where: { id },
    //                         data: {
    //                             albumOrder: startIndex + index * 10,
    //                             album: {
    //                                 connect: {
    //                                     id: album.id
    //                                 }
    //                             }
    //                         }
    //                     })
    //                 )
    //             ))
    //         ]
    //     };
    // }

    deleteSongs: async (
        album: Prisma.AlbumGetPayload<{ include: { songs: true } }>,
        songIds: string[]
    ) => {
        const songs = album.songs;
        const deleteIndexes = songIds.map((id) =>
            songs.findIndex((song) => song.id === id)
        );

        // Sort to handle in correct order
        deleteIndexes.sort((a, b) => a - b);

        await prismaClient.$transaction(async (tx) => {
            // Disconnect songs from album
            for (const id of songIds) {
                await tx.song.update({
                    where: { id },
                    data: {
                        albumOrder: null,
                        album: {
                            disconnect: true
                        }
                    }
                });
            }

            // Adjust albumOrder for remaining songs
            let shiftIndex = 1;
            for (let i = 0; i < deleteIndexes.length - 1; i++) {
                const start = deleteIndexes[i] + 1;
                const end = deleteIndexes[i + 1];

                for (let j = start; j < end; j++) {
                    await tx.song.update({
                        where: { id: songs[j].id },
                        data: {
                            albumOrder: {
                                decrement: shiftIndex
                            }
                        }
                    });
                }

                shiftIndex++;
            }

            // Final batch: adjust songs after the last deleted song
            const lastDeleteIndex = deleteIndexes[deleteIndexes.length - 1];
            for (let i = lastDeleteIndex + 1; i < songs.length; i++) {
                await tx.song.update({
                    where: { id: songs[i].id },
                    data: {
                        albumOrder: {
                            decrement: shiftIndex
                        }
                    }
                });
            }
        });
        return {
            ...album,
            songs: album.songs.filter((song) => !songIds.includes(song.id))
        };
    }
};
