import { UserData } from '../context/UserContextProvider';

/**
 * Utility class to handle specific local storage data.
 */
export class LocalStorage {
    public static getUser(): UserData {
        const userDataRaw = localStorage.getItem('user');
        if (userDataRaw) {
            return JSON.parse(userDataRaw);
        }
        return {};
    }

    public static updateUser(userData: UserData) {
        const newUserData = { ...this.getUser(), ...userData };
        localStorage.setItem('user', JSON.stringify(newUserData));
    }

    public static setUser(userData: UserData) {
        localStorage.setItem('user', JSON.stringify(userData));
    }
}
