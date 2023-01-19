export type Log = (statement: string) => void;
export type Logger = (isDebug: boolean) => Log;

export const getLogger: Logger = (isDebug: boolean) => (statement: string) => {
    if (isDebug) {
        console.log("%cDEBUG SPA-RUNNER: " + statement, "color: blue");
    }
};
