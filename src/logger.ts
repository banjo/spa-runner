export const logger = (isDebug: boolean) => (statement: string) => {
    if (isDebug) {
        console.log("%cDEBUG SPA-RUNNER: " + statement, "color: blue");
    }
};
