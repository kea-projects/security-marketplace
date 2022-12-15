import { marketEntries } from './marketEntries';
import { users } from '../fake-api/users';
import { LoginFormFields } from '../components/auth/LoginForm';
import { SignupFormFields } from '../components/SignupForm';
import { comments } from './comments';

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const login = async (data: LoginFormFields) => {
    await delay(1000);

    for (const user of users) {
        console.log(user, data);
        if (data.password === user.password && data.username === user.username) {
            return true;
        }
    }
    return 'The username or password is incorrect.';
};

export const signup = async (data: SignupFormFields) => {
    await delay(1000);

    console.log(data);
    if (data.fullName !== 'error') {
        users.push(data);
        return true;
    }
    return 'There was a problem creating your account.';
};

export const getMarketEntries = async (amount = 50) => {
    await delay(1000);

    if (amount > 50) {
        amount = 50;
    }
    return marketEntries.slice(0, amount);
};

export const getMarketEntryById = async (id: string) => {
    await delay(1000);

    return marketEntries[Number(id)];
};

export const getUserComments = async () => {
    await delay(1000);

    return comments;
};

export const getCurrentUser = async () => {
    await delay(1000);

    return users[0];
};

export const getUsers = async () => {
    await delay(1000);

    return users;
};
