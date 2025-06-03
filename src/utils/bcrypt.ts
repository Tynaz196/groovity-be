import bcrypt from "bcrypt";

const saltRounds = 10;

export const generateHash = (data: string | Buffer): Promise<string> => {
    return bcrypt.hash(data, saltRounds);
};
export const compareHash = (
    data: string | Buffer,
    encrypted: string
): Promise<boolean> => {
    return bcrypt.compare(data, encrypted);
};
