export function matchWithWildcard(string: string, matcher: string) {
    const escapeRegex = (str: string) =>
        str.replace(/([.*+?^=!:${}()|[\]/\\])/g, "\\$1");
    return new RegExp(
        "^" + matcher.split("*").map(escapeRegex).join(".*") + "$"
    ).test(string);
}
