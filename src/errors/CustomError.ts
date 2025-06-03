interface CustomErrorInterface extends Error {
    statusCode: number;
}

export class CustomError extends Error implements CustomErrorInterface {
    name = "CustomError";
    statusCode: number;
    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
    }
}
