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

const WAIT_FOR_ELEMENT_TIMEOUT = 200;
const WAIT_FOR_ELEMENT_MAXIMUM_TRIES = 20;

export const run = (handler: () => void, config = defaultConfig) => {
    const log = logger(config.isDebug ?? false);

    const runHandler = () => {
        log("Preparing handler...");

        if (config.waitForElement) {
            log("Waiting for element...");
            let tries = 0;

            const element = document.querySelector(config.waitForElement);
            if (!element && tries < WAIT_FOR_ELEMENT_MAXIMUM_TRIES) {
                log("Element not found, trying again...");
                tries++;
                setTimeout(runHandler, WAIT_FOR_ELEMENT_TIMEOUT);
                return;
            }

            if (!element) {
                log("Element not found, giving up...");
                return;
            }

            log("Element found...");
        }

        log("Running handler...");
        setTimeout(handler, config.timeoutBeforeHandlerInit);
        log("Handler done...");
    };

    if (config.runAtStart) {
        log("Running at start...");
        runHandler();
    }

    // used only when the correct url change is found, that triggers the handler
    let lastMatchingPath: string | null = null;
    let lastMatchingSearch: string | null = null;

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
            log("New url found, running handler...");
            lastMatchingPath = window.location.pathname;
            lastMatchingSearch = window.location.search;
            runHandler();
        } else if (isNewUrl) {
            lastPath = window.location.pathname;
            lastSearch = window.location.search;
            log("New url found, but does not match...");
        }
    }, config.timeBetweenUrlLookup);

    return () => {
        log("Stopping...");
        clearInterval(runInterval);
    };
};
