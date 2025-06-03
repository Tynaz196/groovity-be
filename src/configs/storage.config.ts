interface BucketBaseConfigsInterface {
    name: string;
}

interface MusicsBucketConfigsInterface extends BucketBaseConfigsInterface {
    audioFolder: {
        name: string;
    };
    coverFolder: {
        name: string;
    };
}

interface UsersBucketConfigsInterface extends BucketBaseConfigsInterface {
    avatarFolder: {
        name: string;
    };
}

export const musicsBucketConfigs: MusicsBucketConfigsInterface = {
    name: "musics",
    audioFolder: {
        name: "audio"
    },
    coverFolder: {
        name: "covers"
    }
};

export const usersBucketConfigs: UsersBucketConfigsInterface = {
    name: "users",
    avatarFolder: {
        name: "avatar"
    }
};
