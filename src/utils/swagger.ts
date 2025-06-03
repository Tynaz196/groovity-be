export const convertToOpenApiRoute = (route: string): string => {
    return route.replace(/:([^/]+)/g, "{$1}");
};
