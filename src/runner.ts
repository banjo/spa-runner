import { Config, Handler } from ".";
import { Log } from "./logger";

const WAIT_FOR_ELEMENT_TIMEOUT = 200;
const WAIT_FOR_ELEMENT_MAXIMUM_TRIES = 10;

export const getRunner = (log: Log, handler: Handler, config: Config) => () => {
    log("Preparing handler...");

    if (config.waitForElement) {
        log("Waiting for element...");
        let tries = 0;

        const waitForElementInterval = setInterval(() => {
            const element = document.querySelector(config.waitForElement!);

            if (!element && tries < WAIT_FOR_ELEMENT_MAXIMUM_TRIES) {
                log("Element not found, trying again...");
                tries++;
            } else if (element) {
                log("Element found...");
                clearInterval(waitForElementInterval);
                log("Running handler...");
                setTimeout(handler, config.timeoutBeforeHandlerInit);
                log("Handler done...");
            } else {
                log("Element not found, giving up...");
                clearInterval(waitForElementInterval);
            }
        }, WAIT_FOR_ELEMENT_TIMEOUT);

        return;
    }

    log("Running handler...");
    setTimeout(handler, config.timeoutBeforeHandlerInit);
    log("Handler done...");
};
