type Config = {
    timeBetweenUrlLookup?: number;
};

export const run = (
    handler: () => void,
    config: Config = { timeBetweenUrlLookup: 250 }
) => {
    let lastPath: string | null = null;
    let lastSearch: string | null = null;

    const runInterval = setInterval(() => {
        const isNewUrl =
            lastPath !== window.location.pathname ||
            lastSearch !== window.location.search;
        const isNotInitiated = lastPath === null || lastSearch === null;

        if (isNewUrl || isNotInitiated) {
            lastPath = window.location.pathname;
            lastSearch = window.location.search;
            handler();
        }
    }, config.timeBetweenUrlLookup);

    return () => clearInterval(runInterval);
};
