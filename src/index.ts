import { getLogger } from "./logger";
import { matchWithWildcard } from "./match";
import { getRunner } from "./runner";

export type Config = {
    /**
     * Time between url lookups in milliseconds.
     */
    timeBetweenUrlLookup?: number;
    /**
     * Urls to run the handler on.
     * If empty, the handler will run on every url.
     * If not empty, the handler will only run on urls that match one of the urls in the array.
     * The urls can contain wildcards.
     * Example: ["https://www.example.com/*", "https://www.example.com/other/*"]
     */
    urls?: string[];
    /**
     * Time to wait before running the handler in milliseconds.
     * This runs after timeoutBeforeRunnerInit. Before your own code is executed.
     */
    timeoutBeforeHandlerInit?: number;

    /**
     * Time to wait before running the runner in milliseconds.
     * This runs before timeoutBeforeHandlerInit. The runner is responsible for finding the element to wait for. Prefer this one if you want to wait for the page to load.
     * Defaults: null
     */
    timeoutBeforeRunnerInit?: number | null;
    /**
     * If true, the handler will run at start.
     * Default: true
     */
    runAtStart?: boolean;
    /**
     * If set, the handler will wait for the element to be present before running.
     */
    waitForElement?: string;
    /**
     * If true, some logs will be printed to the console for debugging.
     */
    isDebug?: boolean;
};

export type Handler = () => void;

const defaultConfig: Config = {
    timeBetweenUrlLookup: 500,
    urls: [],
    timeoutBeforeHandlerInit: 0,
    timeoutBeforeRunnerInit: null,
    runAtStart: true,
    waitForElement: undefined,
    isDebug: false
};

export const run = (handler: Handler, config = defaultConfig) => {
    config = { ...defaultConfig, ...config };

    const logger = getLogger(config.isDebug ?? false);
    const runner = getRunner(logger, handler, config);

    if (config?.runAtStart) {
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
            if (config.timeoutBeforeRunnerInit) {
                setTimeout(runner, config.timeoutBeforeRunnerInit);
            } else {
                runner();
            }
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
