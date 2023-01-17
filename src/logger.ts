export const logger = (isDebug: boolean) => (statement: string) => {
    if (isDebug) {
        console.log(statement);
    }
};
