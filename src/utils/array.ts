export const getDuplicates = <T>(arr: T[]): T[] => {
    const seen = new Set<T>();
    const duplicates = new Set<T>();

    for (const value of arr) {
        if (seen.has(value)) {
            duplicates.add(value);
        } else {
            seen.add(value);
        }
    }

    return Array.from(duplicates);
};
