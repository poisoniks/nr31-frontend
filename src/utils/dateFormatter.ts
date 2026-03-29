export class DateFormatter {
    /**
     * Formats a date string into a localized format.
     */
    static formatDate(isoString: string, lang: string): string {
        const date = new Date(isoString);
        const locale = lang || 'en';
        return date.toLocaleDateString(locale, { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        });
    }

    /**
     * Formats a time string into a localized format.
     */
    static formatTime(isoString: string, lang: string): string {
        const date = new Date(isoString);
        const locale = lang || 'en';
        return date.toLocaleTimeString(locale, { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

    /**
     * Formats a date and time string into a localized format.
     */
    static formatDateTime(isoString: string, lang: string): string {
        const date = new Date(isoString);
        const locale = lang || 'en';
        return date.toLocaleString(locale, {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }
}
