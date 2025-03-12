export const getParamsFromUrl = (url: string): Record<string, string> => {
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);

    const paramPairs: { [key: string]: string } = {};
    params.forEach((value, key) => {
        paramPairs[key] = value;
    });

    return paramPairs;
}