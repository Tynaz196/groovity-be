import _ from "lodash";

export const pickPropsFromObject = <T extends object, K extends keyof T>(
    data: T,
    props: K | K[]
): Pick<T, K> => {
    return _.pick(data, props);
};

export const omitPropsFromObject = <T extends object, K extends keyof T>(
    data: T,
    props: K | K[]
): Omit<T, K> => {
    return _.omit(data, props);
};
