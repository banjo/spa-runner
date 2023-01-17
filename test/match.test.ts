import { matchWithWildcard } from "../src/match";
import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";

describe("matchWithWildard", () => {
    it("should match with wildcard", () => {
        expect(matchWithWildcard("foo", "foo")).toBe(true);
        expect(matchWithWildcard("foo", "foo*")).toBe(true);
        expect(matchWithWildcard("foo bar baz", "foo*baz")).toBe(true);
        expect(matchWithWildcard("foo bar baz hello bar", "foo*baz*bar")).toBe(
            true
        );
    });

    it("should work with some urls", () => {
        expect(matchWithWildcard("https://google.com", "https://*")).toBe(true);
        expect(matchWithWildcard("https://google.com", "https://*.com")).toBe(
            true
        );
        expect(
            matchWithWildcard(
                "https://github.com/banjo/spa-runner/settings",
                "https://github.com/banjo/*/settings"
            )
        ).toBe(true);

        expect(
            matchWithWildcard(
                "https://github.com/banjo/spa-runner/settings",
                "*//github.com/banjo/*/settings"
            )
        ).toBe(true);
    });
});
