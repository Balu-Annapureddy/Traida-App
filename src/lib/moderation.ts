// Simple static list - Phase 2A requirement: No AI, No external service.
const BLACKLIST = [
    "badwords", "spam", "scam", "naughty", "word1", "word2" // Placeholder list
];

export function scrubText(text: string): string {
    let scrubbed = text;
    BLACKLIST.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        scrubbed = scrubbed.replace(regex, '*'.repeat(word.length));
    });
    return scrubbed;
}

export function isSpam(text: string): boolean {
    if (text.length > 500) return true;
    if (text === text.toUpperCase() && text.length > 10) return true; // SHOUTING
    return false;
}
