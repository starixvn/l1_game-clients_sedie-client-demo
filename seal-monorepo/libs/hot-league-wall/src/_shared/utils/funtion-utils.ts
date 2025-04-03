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

    export const isFunctionNotExistedOrEmpty = (func: Function) => {
        if (!func) return true;
        // Convert the function to a string
        const funcStr = func.toString();

        // Use a regular expression to match the function body
        const bodyMatch = funcStr.match(/{([\s\S]*?)}/);

        // Check if the body is empty (contains only whitespace)
        if (bodyMatch && bodyMatch[1].trim() === '') {
            return true; // Function is empty
        }
        return false; // Function is not empty
    };
}
