import multer, { FileFilterCallback } from "multer";
import path from "path";
import { Request } from "express";
import { CustomError } from "@/errors/index.js";
import { StatusCodes } from "http-status-codes";

type SingleUploadOptions = {
    fieldName: string;
    allowedExtensions?: string[];
    maxSize?: number;
};

type MultipleUploadOptions = {
    fieldName: string;
    allowedExtensions?: string[];
    maxSize?: number;
    maxCount?: number;
};

type FieldsUploadOptions = {
    fields: { name: string; maxCount?: number; allowedExtensions?: string[] }[];
    maxSize?: number;
};

const storage = multer.memoryStorage();

const fileFilter =
    (allowedExtensions?: string[]) =>
    (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
        if (!allowedExtensions || allowedExtensions.length === 0) {
            return cb(null, true); // Accept all file types
        }

        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedExtensions.includes(ext)) {
            cb(null, true);
        } else {
            cb(
                new CustomError(
                    `File type not allowed. Allowed extensions: ${allowedExtensions.join(", ")}`,
                    StatusCodes.BAD_REQUEST
                )
            );
        }
    };

export const singleFileUpload = ({
    fieldName,
    allowedExtensions,
    maxSize = 50 * 1024 * 1024
}: SingleUploadOptions) => {
    return multer({
        storage,
        limits: { fileSize: maxSize },
        fileFilter: fileFilter(allowedExtensions)
    }).single(fieldName);
};

export const multipleFileUpload = ({
    fieldName,
    allowedExtensions,
    maxSize = 50 * 1024 * 1024,
    maxCount = 10
}: MultipleUploadOptions) => {
    return multer({
        storage,
        limits: { fileSize: maxSize },
        fileFilter: fileFilter(allowedExtensions)
    }).array(fieldName, maxCount);
};

export const fieldsFileUpload = ({
    fields,
    maxSize = 50 * 1024 * 1024
}: FieldsUploadOptions) => {
    return multer({
        storage,
        limits: { fileSize: maxSize },
        fileFilter: (req, file, cb) => {
            const fieldConfig = fields.find((f) => f.name === file.fieldname);
            const allowedExtensions = fieldConfig?.allowedExtensions;
            fileFilter(allowedExtensions)(req, file, cb);
        }
    }).fields(fields.map(({ name, maxCount }) => ({ name, maxCount })));
};
