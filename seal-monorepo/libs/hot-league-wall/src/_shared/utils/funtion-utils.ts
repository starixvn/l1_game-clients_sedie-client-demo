export namespace FunctionUtils {
    export const delay = async (milliseconds: number) => {
        let timeoutId: NodeJS.Timeout;
        return new Promise<void>((resolve) => {
            timeoutId = setTimeout(() => {
                clearTimeout(timeoutId);
                resolve();
            }, milliseconds);
        });
    };
}
