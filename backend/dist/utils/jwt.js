import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
export const generateToken = (payload) => {
    const options = {
        expiresIn: (config.jwt.expiresIn || '30d')
    };
    return jwt.sign(payload, config.jwt.secret, options);
};
export const generateRefreshToken = (payload) => {
    const options = {
        expiresIn: (config.jwt.refreshExpiresIn || '7d')
    };
    return jwt.sign(payload, config.jwt.refreshSecret, options);
};
export const verifyToken = (token) => {
    try {
        return jwt.verify(token, config.jwt.secret);
    }
    catch (error) {
        return null;
    }
};
export const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, config.jwt.refreshSecret);
    }
    catch (error) {
        return null;
    }
};
