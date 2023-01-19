import { run } from "../src/index";
import { describe, it, expect, vi, beforeEach } from "vitest";

const updateWindowLocation = (url: string) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.location = new URL(url);
};

describe("run", () => {
    vi.useFakeTimers();
    const defaultUrl = "https://www.test.com";
    const timeBetweenUrlLookup = 500;

    beforeEach(() => {
        updateWindowLocation(defaultUrl);
    });

    it("should run", () => {
        expect(run).toBeDefined();
    });

    it("should run handler once on startup if configured", () => {
        const handler = vi.fn();
        const unsubscribe = run(handler, {
            runAtStart: true,
            timeBetweenUrlLookup: timeBetweenUrlLookup
        });
        vi.advanceTimersToNextTimer(); // run handler in timeout
        vi.advanceTimersByTime(timeBetweenUrlLookup + 1); // run first interval
        unsubscribe();
        expect(handler).toHaveBeenCalledTimes(1);
    });

    it("should not run handler on startup if not configured", () => {
        const handler = vi.fn();
        const unsubscribe = run(handler, {
            runAtStart: false,
            timeBetweenUrlLookup: timeBetweenUrlLookup
        });
        vi.advanceTimersToNextTimer(); // run handler in timeout
        vi.advanceTimersByTime(timeBetweenUrlLookup + 1); // run first interval
        unsubscribe();
        expect(handler).toHaveBeenCalledTimes(0);
    });

    it("should run handler on url change if configured", () => {
        const handler = vi.fn();
        const unsubscribe = run(handler, {
            runAtStart: false,
            timeBetweenUrlLookup: timeBetweenUrlLookup
        });
        updateWindowLocation(defaultUrl + "/test");
        vi.advanceTimersToNextTimer(); // run handler in timeout
        vi.advanceTimersByTime(timeBetweenUrlLookup + 1); // run first interval
        vi.advanceTimersByTime(1000); // arbitrary time to run more intervals
        unsubscribe();
        expect(handler).toHaveBeenCalledTimes(1);
    });

    it("should run on start and on url change", () => {
        const handler = vi.fn();
        const unsubscribe = run(handler, {
            runAtStart: true,
            timeBetweenUrlLookup: timeBetweenUrlLookup
        });
        updateWindowLocation(defaultUrl + "/test");
        vi.advanceTimersToNextTimer(); // run handler in timeout
        vi.advanceTimersByTime(timeBetweenUrlLookup + 1); // run first interval
        vi.advanceTimersByTime(1000); // arbitrary time to run more intervals
        unsubscribe();
        expect(handler).toHaveBeenCalledTimes(2);
    });

    it("should run on multiple url changes", () => {
        const handler = vi.fn();
        const unsubscribe = run(handler, {
            runAtStart: false,
            timeBetweenUrlLookup: timeBetweenUrlLookup
        });
        updateWindowLocation(defaultUrl + "/test");
        vi.advanceTimersToNextTimer(); // run handler in timeout
        vi.advanceTimersByTime(timeBetweenUrlLookup + 1); // run first interval
        updateWindowLocation(defaultUrl + "/test2");
        vi.advanceTimersByTime(timeBetweenUrlLookup + 1); // run second interval
        updateWindowLocation(defaultUrl + "/test3");
        vi.advanceTimersByTime(timeBetweenUrlLookup + 1); // run third interval
        vi.advanceTimersByTime(1000); // arbitrary time to run more intervals
        unsubscribe();
        expect(handler).toHaveBeenCalledTimes(3);
    });

    it("should run on matching url change", () => {
        const handler = vi.fn();
        const unsubscribe = run(handler, {
            runAtStart: false,
            timeBetweenUrlLookup: timeBetweenUrlLookup,
            urls: [defaultUrl + "/test"]
        });
        updateWindowLocation(defaultUrl + "/test");
        vi.advanceTimersToNextTimer(); // run handler in timeout
        vi.advanceTimersByTime(timeBetweenUrlLookup + 1); // run first interval
        updateWindowLocation(defaultUrl + "/somethingelse");
        vi.advanceTimersByTime(timeBetweenUrlLookup + 1); // run second interval
        updateWindowLocation(defaultUrl + "/hello");
        vi.advanceTimersByTime(timeBetweenUrlLookup + 1); // run third interval
        vi.advanceTimersByTime(1000); // arbitrary time to run more intervals
        unsubscribe();
        expect(handler).toHaveBeenCalledTimes(1);
    });

    it("should run on mulitple matching url changes", () => {
        const handler = vi.fn();
        const unsubscribe = run(handler, {
            runAtStart: false,
            timeBetweenUrlLookup: timeBetweenUrlLookup,
            urls: [defaultUrl + "/test", defaultUrl + "/test2"]
        });
        updateWindowLocation(defaultUrl + "/test");
        vi.advanceTimersToNextTimer(); // run handler in timeout
        vi.advanceTimersByTime(timeBetweenUrlLookup + 1); // run first interval
        updateWindowLocation(defaultUrl + "/somethingelse");
        vi.advanceTimersByTime(timeBetweenUrlLookup + 1); // run second interval
        updateWindowLocation(defaultUrl + "/test2");
        vi.advanceTimersByTime(timeBetweenUrlLookup + 1); // run third interval
        vi.advanceTimersByTime(1000); // arbitrary time to run more intervals
        unsubscribe();
        expect(handler).toHaveBeenCalledTimes(2);
    });

    it("should match on same url match two times", () => {
        const handler = vi.fn();
        const unsubscribe = run(handler, {
            runAtStart: false,
            timeBetweenUrlLookup: timeBetweenUrlLookup,
            urls: [defaultUrl + "/test"]
        });
        updateWindowLocation(defaultUrl + "/test");
        vi.advanceTimersToNextTimer(); // run handler in timeout
        vi.advanceTimersByTime(timeBetweenUrlLookup + 1); // run first interval
        updateWindowLocation(defaultUrl + "/somethingelse");
        vi.advanceTimersByTime(timeBetweenUrlLookup + 1); // run second interval
        updateWindowLocation(defaultUrl + "/test");
        vi.advanceTimersByTime(timeBetweenUrlLookup + 1); // run third interval
        vi.advanceTimersByTime(1000); // arbitrary time to run more intervals
        unsubscribe();
        expect(handler).toHaveBeenCalledTimes(2);
    });

    it("should match on wildcard url", () => {
        const handler = vi.fn();
        const unsubscribe = run(handler, {
            runAtStart: false,
            timeBetweenUrlLookup: timeBetweenUrlLookup,
            urls: ["*"]
        });
        updateWindowLocation(defaultUrl + "/test");
        vi.advanceTimersToNextTimer(); // run handler in timeout
        vi.advanceTimersByTime(timeBetweenUrlLookup + 1); // run first interval
        updateWindowLocation(defaultUrl + "/somethingelse");
        vi.advanceTimersByTime(timeBetweenUrlLookup + 1); // run second interval
        updateWindowLocation(defaultUrl + "/test");
        vi.advanceTimersByTime(timeBetweenUrlLookup + 1); // run third interval
        vi.advanceTimersByTime(1000); // arbitrary time to run more intervals
        unsubscribe();
        expect(handler).toHaveBeenCalledTimes(3);
    });

    it("should match on specific wildcard url", () => {
        const handler = vi.fn();
        const unsubscribe = run(handler, {
            runAtStart: false,
            timeBetweenUrlLookup: timeBetweenUrlLookup,
            urls: ["*/test"]
        });
        updateWindowLocation(defaultUrl + "/test");
        vi.advanceTimersToNextTimer(); // run handler in timeout
        vi.advanceTimersByTime(timeBetweenUrlLookup + 1); // run first interval
        updateWindowLocation(defaultUrl + "/somethingelse");
        vi.advanceTimersByTime(timeBetweenUrlLookup + 1); // run second interval
        updateWindowLocation(defaultUrl + "/test");
        vi.advanceTimersByTime(timeBetweenUrlLookup + 1); // run third interval
        vi.advanceTimersByTime(1000); // arbitrary time to run more intervals
        unsubscribe();
        expect(handler).toHaveBeenCalledTimes(2);
    });

    it("should match on specific wildcard url with multiple wildcards", () => {
        const handler = vi.fn();
        const unsubscribe = run(handler, {
            runAtStart: false,
            timeBetweenUrlLookup: timeBetweenUrlLookup,
            urls: ["*/hello/*/test"]
        });
        updateWindowLocation(defaultUrl + "/hello/world/test");
        vi.advanceTimersToNextTimer(); // run handler in timeout
        vi.advanceTimersByTime(timeBetweenUrlLookup + 1); // run first interval
        updateWindowLocation(defaultUrl + "/somethingelse");
        vi.advanceTimersByTime(timeBetweenUrlLookup + 1); // run second interval
        updateWindowLocation(defaultUrl + "/hello/somethingelse/test");
        vi.advanceTimersByTime(timeBetweenUrlLookup + 1); // run third interval
        vi.advanceTimersByTime(1000); // arbitrary time to run more intervals
        unsubscribe();
        expect(handler).toHaveBeenCalledTimes(2);
    });
});
