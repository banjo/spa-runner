import { matchWithWildcard } from "./match";

type Config = {
    timeBetweenUrlLookup?: number;
    urls?: string[];
    timeoutBeforeHandlerInit?: number;
    runAtStart?: boolean;
};

const defaultConfig: Config = {
    timeBetweenUrlLookup: 500,
    urls: [],
    timeoutBeforeHandlerInit: 0,
    runAtStart: true
};

export const run = (handler: () => void, config = defaultConfig) => {
    const runHandler = () => {
        setTimeout(handler, config.timeoutBeforeHandlerInit);
    };

    if (config.runAtStart) runHandler();

    let lastPath: string | null = null;
    let lastSearch: string | null = null;

    const runInterval = setInterval(() => {
        const isNewUrl =
            lastPath !== window.location.pathname ||
            lastSearch !== window.location.search;
        const isNotInitiated = lastPath === null || lastSearch === null;

        const hasUrls = config.urls && config.urls.length > 0;
        const matchesUrl = hasUrls
            ? config.urls?.some((url) =>
                  matchWithWildcard(window.location.href, url)
              )
            : true;

        if ((isNewUrl || isNotInitiated) && matchesUrl) {
            lastPath = window.location.pathname;
            lastSearch = window.location.search;
            runHandler();
        }
    }, config.timeBetweenUrlLookup);

    return () => clearInterval(runInterval);
};
