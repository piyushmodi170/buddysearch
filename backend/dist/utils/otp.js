import { config } from '../config/index.js';
export const generateOTP = () => {
    if (config.nodeEnv === 'development') {
        return '123456';
    }
    return Math.floor(100000 + Math.random() * 900000).toString();
};
export const sendOTP = async (phone, code) => {
    try {
        if (config.otp.provider === 'console' || config.nodeEnv === 'development') {
            console.log(`[OTP] Sending ${code} to ${phone}`);
            return true;
        }
        if (config.otp.provider === 'twilio') {
            // Implement Twilio sending here
            console.log(`[Twilio] Would send ${code} to ${phone}`);
            return true;
        }
        return false;
    }
    catch (error) {
        console.error('Failed to send OTP:', error);
        return false;
    }
};
