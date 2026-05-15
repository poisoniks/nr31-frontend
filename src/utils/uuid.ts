/**
 * Generate a unique identifier for UI purposes
 * Uses crypto.randomUUID() if available, falls back to a simple random string
 */
export function generateUiId(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    // Fallback for older browsers
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}
