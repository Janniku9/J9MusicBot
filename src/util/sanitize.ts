export function sanitize(s: string) : string {
    return s
        .replace(/<.*>/g, "")
        .replace(/@/g, "")
        .replace(/\*\*/g, "");
}