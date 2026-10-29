/** Accept only this app's origin or its explicitly configured public tunnel origin. */
export function isAllowedStudyOrigin(origin: string | null, requestUrl: string, publicOrigin?: string): boolean {
 if (!origin || origin === "null") return false;
 if (origin === new URL(requestUrl).origin) return true;
 if (!publicOrigin) return false;
 try { return origin === new URL(publicOrigin).origin; } catch { return false; }
}
