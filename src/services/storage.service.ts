import supabaseClient from "@/databases/storage.js";
import logger from "@/utils/logger.js";
import { randomUUID } from "crypto";
import { fileTypeFromBuffer } from "file-type";
import { CustomError } from "@/errors/CustomError.js";
import { StatusCodes } from "http-status-codes";
import { FileObject, StorageError } from "@supabase/storage-js";

interface StorageServiceInterface {
    uploadOne: (
        bucket: string,
        folder: string,
        buffer: Buffer
    ) => Promise<string>;
    deleteOne: (bucket: string, filePath: string) => Promise<FileObject>;
    uploadMany: (
        bucket: string,
        files: { folder: string; buffer: Buffer }[]
    ) => Promise<
        | {
              success: true;
              filePaths: string[];
          }
        | {
              success: false;
              filePaths: null;
          }
    >;
    deleteMany: (
        bucket: string,
        filePaths: string[]
    ) => Promise<
        | {
              success: true;
              datas: FileObject[];
              errors: null;
          }
        | {
              success: false;
              datas: null;
              errors: StorageError[];
          }
    >;
    generateUrl: (
        bucket: string,
        filePath: string,
        duration?: number
    ) => Promise<string | null>;
}

export const storageService: StorageServiceInterface = {
    uploadOne: async (bucket: string, folder: string, buffer: Buffer) => {
        const fileType = await fileTypeFromBuffer(buffer);
        if (!fileType) {
            throw new CustomError(
                "Cannot detect file type",
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
        const { ext, mime } = fileType;
        const fileName = `${randomUUID()}.${ext}`;
        const filePath = `${folder}/${fileName}`;

        const { error } = await supabaseClient.storage
            .from(bucket)
            .upload(filePath, buffer, { contentType: mime });
        if (error) {
            logger.warn(
                `Cannot upload ${filePath} in bucket ${bucket}. Error: ${error}`
            );
            throw new CustomError(
                error.message,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
        return filePath;
    },

    deleteOne: async (bucket: string, filePath: string) => {
        const { error, data } = await supabaseClient.storage
            .from(bucket)
            .remove([filePath]);
        if (error) {
            logger.warn(
                `Cannot delete ${filePath} in bucket ${bucket}. Error: ${error}`
            );
            throw new CustomError(
                error.message,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
        return data[0];
    },

    deleteMany: async (
        bucket: string,
        filePaths: string[]
    ): Promise<
        | { success: true; datas: FileObject[]; errors: null }
        | { success: false; datas: null; errors: StorageError[] }
    > => {
        const datas: FileObject[] = new Array(filePaths.length);
        const errors: StorageError[] = new Array(filePaths.length);

        try {
            const results = await Promise.allSettled(
                filePaths.map((filePath, index) => {
                    return storageService
                        .deleteOne(bucket, filePath)
                        .then((data) => (datas[index] = data))
                        .catch((err) => {
                            errors[index] = err;
                            throw err;
                        });
                })
            );
            if (results.some((res) => res.status === "rejected")) {
                throw new CustomError(
                    "Error while deleting files",
                    StatusCodes.INTERNAL_SERVER_ERROR
                );
            }
            return { success: true, datas, errors: null };
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            return { success: false, datas: null, errors };
        }
    },

    uploadMany: async (
        bucket: string,
        files: { folder: string; buffer: Buffer }[]
    ): Promise<
        | { success: true; filePaths: string[] }
        | { success: false; filePaths: null }
    > => {
        const filePaths: string[] = [];

        try {
            const results = await Promise.allSettled(
                files.map((file, index) => {
                    const { folder, buffer } = file;
                    return storageService
                        .uploadOne(bucket, folder, buffer)
                        .then((filePath) => (filePaths[index] = filePath));
                })
            );
            if (results.some((res) => res.status === "rejected")) {
                throw new Error("Failed to upload file");
            }
            return { success: true, filePaths };
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            const successUploadedFilepaths: string[] = filePaths.filter(
                (value) => value != null
            );
            await storageService.deleteMany(bucket, successUploadedFilepaths);
            return { success: false, filePaths: null };
        }
    },

    generateUrl: async (
        bucket: string,
        filePath: string,
        duration: number = 900
    ) => {
        const { data, error } = await supabaseClient.storage
            .from(bucket)
            .createSignedUrl(filePath, duration);
        if (error) {
            logger.warn(
                `Cannot generate url for ${filePath} in bucket ${bucket}. Error: ${error}`
            );
        }
        return data ? data.signedUrl : null;
    }
};
