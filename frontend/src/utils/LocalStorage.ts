import { UserData } from '../context/UserContextProvider';

/**
 * Utility class to handle specific local storage data.
 */
export class LocalStorage {
    /**
     * Retrieves the user data from the local storage.
     * @returns the `UserData` of the user, or an empty object, if there is no user data set.
     */
    public static getUser(): UserData {
        const userDataRaw = localStorage.getItem('user');
        if (userDataRaw) {
            return JSON.parse(userDataRaw);
        }
        return {};
    }

    /**
     * Updates the user data in the local storage with only the fields that have changed.
     * @param userData
     */
    public static updateUser(userData: UserData) {
        const newUserData = { ...this.getUser(), ...userData };
        localStorage.setItem('user', JSON.stringify(newUserData));
    }

    /**
     * Replaces the user data in the local storage with the newly provided data.
     * @param userData
     */
    public static setUser(userData: UserData) {
        localStorage.setItem('user', JSON.stringify(userData));
    }
}
