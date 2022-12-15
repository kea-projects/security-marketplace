import jwt_decode from 'jwt-decode';
import { LocalStorage } from './LocalStorage';

export enum AuthRoles {
    USER = 'user',
    ADMIN = 'admin',
}

interface TokenData {
    sub: string;
    userId: string;
    role: AuthRoles;
    exp: number;
    iat: number;
}

export const getTokenData = (token: string) => {
    return jwt_decode<TokenData>(token);
};

export const tokenIsExpired = (token: string) => {
    const expirationTime = getTokenData(token).exp;
    if (new Date(expirationTime * 1000) < new Date()) {
        return true;
    }
    return false;
};

export const isNotLoggedIn = () => {
    const userData = LocalStorage.getUser();
    if (userData.refreshToken && userData.accessToken) {
        if (!tokenIsExpired(userData.accessToken) || !tokenIsExpired(userData.refreshToken)) {
            return false;
        }
        return true;
    }
    return true;
};

export const hasUserPrivileges = () => {
    const userData = LocalStorage.getUser();
    if (userData.role && (userData.role === AuthRoles.USER || userData.role === AuthRoles.ADMIN)) {
        return true;
    }
    return false;
};

export const hasAdminPrivileges = () => {
    const userData = LocalStorage.getUser();
    if (userData.role && userData.role === AuthRoles.ADMIN) {
        return true;
    }
    return false;
};

export const isOwnProfile = (userId: string) => {
    const userData = LocalStorage.getUser();
    if (userData.userId && userData.userId === userId) {
        return true;
    }
    return false;
};
