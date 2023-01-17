import { logger } from "./logger";
import { matchWithWildcard } from "./match";

type Config = {
    timeBetweenUrlLookup?: number;
    urls?: string[];
    timeoutBeforeHandlerInit?: number;
    runAtStart?: boolean;
    waitForElement?: string;
    isDebug?: boolean;
};

const defaultConfig: Config = {
    timeBetweenUrlLookup: 500,
    urls: [],
    timeoutBeforeHandlerInit: 0,
    runAtStart: true,
    waitForElement: undefined,
    isDebug: false
};

export const run = (handler: () => void, config = defaultConfig) => {
    const log = logger(config.isDebug ?? false);

    const runHandler = () => {
        log("Preparing handler...");

        if (config.waitForElement) {
            log("Waiting for element...");

            const element = document.querySelector(config.waitForElement);
            if (!element) {
                log("Element not found, trying again...");
                setTimeout(runHandler, 100);
                return;
            }
        }

        log("Running handler...");
        setTimeout(handler, config.timeoutBeforeHandlerInit);
    };

    if (config.runAtStart) {
        log("Running at start...");
        runHandler();
    }

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
            log("New url found, running handler...");
            lastPath = window.location.pathname;
            lastSearch = window.location.search;
            runHandler();
        }
    }, config.timeBetweenUrlLookup);

    return () => {
        log("Stopping...");
        clearInterval(runInterval);
    };
};
