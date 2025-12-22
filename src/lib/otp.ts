import { randomInt } from 'crypto';

export const OTPUtils = {
    generate: () => {
        // Generate secure 6-digit OTP
        return randomInt(100000, 999999).toString();
    },

    getExpiry: () => {
        // 10 minutes from now
        return new Date(Date.now() + 10 * 60 * 1000);
    }
};
