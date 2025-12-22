export const EmailService = {
    sendOTP: async (email: string, otp: string) => {
        // In Prod: Use Resend / SendGrid
        // In Dev: Log to console
        console.log(`[EMAIL_MOCK] To: ${email} | Subject: TRAIDA Verification Code | Body: Your code is ${otp}`);
        return true;
    }
};
