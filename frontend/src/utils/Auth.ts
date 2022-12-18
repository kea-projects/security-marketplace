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

/**
 * Retrieves the data from the JWT payload.
 * @param token
 * @returns the token payload data.
 */
export const getTokenData = (token: string) => {
    return jwt_decode<TokenData>(token);
};

/**
 * Checks if the provided token is expired or not.
 * @param token
 * @returns `true` or `false` if the token is expired.
 */
export const tokenIsExpired = (token: string) => {
    const expirationTime = getTokenData(token).exp;
    if (new Date(expirationTime * 1000) < new Date()) {
        return true;
    }
    return false;
};

/**
 * Checks if the user is currently not logged in.
 * @returns `true` or `false` depending on whether the user is logged in or not.
 */
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

/**
 * Checks if the user has user role privileges.
 * @returns `true` or `false` depending on whether the user has user role privileges.
 */
export const hasUserPrivileges = () => {
    const userData = LocalStorage.getUser();
    if (userData.role && (userData.role === AuthRoles.USER || userData.role === AuthRoles.ADMIN)) {
        return true;
    }
    return false;
};

/**
 * Checks if the user has admin role privileges.
 * @returns `true` or `false` depending on whether the user has admin role privileges.
 */
export const hasAdminPrivileges = () => {
    const userData = LocalStorage.getUser();
    if (userData.role && userData.role === AuthRoles.ADMIN) {
        return true;
    }
    return false;
};

/**
 * Checks if the user is accessing his own data or another user's.
 * @param userId - the id of the user whose profile is being accessed.
 * @returns `true` or `false` depending on whether the user is accessing his own data or not.
 */
export const isOwnProfile = (userId: string) => {
    const userData = LocalStorage.getUser();
    if (userData.userId && userData.userId === userId) {
        return true;
    }
    return false;
};
