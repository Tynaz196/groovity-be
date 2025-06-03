import { Gender } from "@prisma/client";

export type SignUpDto = {
    username: string;
    email: string;
    password: string;
    userProfile: {
        name: string;
        gender: Gender;
        birth: Date;
        phone: string;
    };
};

export type SignInDto = {
    username: string;
    password: string;
};
