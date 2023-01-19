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

    let lastPath = window.location.pathname;
    let lastSearch = window.location.search;

    const runInterval = setInterval(() => {
      
        const isNewUrl =
            lastPath !== window.location.pathname ||
            lastSearch !== window.location.search;

        const hasUrls = config.urls && config.urls.length > 0;
        const matchesUrl = hasUrls
            ? config.urls?.some((url) =>
                  matchWithWildcard(window.location.href, url)
              )
            : true;

        if (isNewUrl && matchesUrl) {
            logger("New url found, running handler...");
            lastPath = window.location.pathname;
            lastSearch = window.location.search;
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
