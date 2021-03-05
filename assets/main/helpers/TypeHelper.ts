export function isNumeric<T>(value: T): boolean {
    if (typeof value !== "string") {
        return false;
    }
    // @ts-expect-error
    return !isNaN(value) && !isNaN(parseFloat(value));
}
