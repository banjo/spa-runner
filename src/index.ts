import { getRunner } from "./runner";
import { getLogger } from "./logger";
import { matchWithWildcard } from "./match";

export type Config = {
    timeBetweenUrlLookup?: number;
    urls?: string[];
    timeoutBeforeHandlerInit?: number;
    runAtStart?: boolean;
    waitForElement?: string;
    isDebug?: boolean;
};

export type Handler = () => void;

const defaultConfig: Config = {
    timeBetweenUrlLookup: 500,
    urls: [],
    timeoutBeforeHandlerInit: 0,
    runAtStart: true,
    waitForElement: undefined,
    isDebug: false
};

export const run = (handler: Handler, config = defaultConfig) => {
    const logger = getLogger(config.isDebug ?? false);
    const runner = getRunner(logger, handler, config);

    if (config.runAtStart) {
        logger("Running at start...");
        runner();
    }

    // used only when the correct url change is found, that triggers the handler
    let lastMatchingPath = window.location.pathname;
    let lastMatchingSearch = window.location.search;

    // used for every url change
    let lastPath = window.location.pathname;
    let lastSearch = window.location.search;

    const runInterval = setInterval(() => {
        const isNewMatchingUrl =
            lastMatchingPath !== window.location.pathname ||
            lastMatchingSearch !== window.location.search;

        const isNewUrl =
            lastPath !== window.location.pathname ||
            lastSearch !== window.location.search;
        const isNotInitiated =
            lastMatchingPath === null || lastMatchingSearch === null;

        const hasUrls = config.urls && config.urls.length > 0;
        const matchesUrl = hasUrls
            ? config.urls?.some((url) =>
                  matchWithWildcard(window.location.href, url)
              )
            : true;

        if ((isNewMatchingUrl || isNotInitiated) && matchesUrl) {
            logger("New url found, running handler...");
            lastMatchingPath = window.location.pathname;
            lastMatchingSearch = window.location.search;
            runner();
        } else if (isNewUrl) {
            lastPath = window.location.pathname;
            lastSearch = window.location.search;
            logger("New url found, but does not match...");
        }
    }, config.timeBetweenUrlLookup);

    return () => {
        logger("Stopping...");
        clearInterval(runInterval);
    };
};
