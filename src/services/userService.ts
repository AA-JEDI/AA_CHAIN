import { User } from '@/types';
import { mockUsers, searchUsers, getUserById } from '@/mock/users';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const userService = {
    async search(query: string): Promise<User[]> {
        await delay(300);
        return searchUsers(query);
    },

    async getById(id: string): Promise<User | undefined> {
        await delay(200);
        return getUserById(id);
    },

    async getAll(): Promise<User[]> {
        await delay(300);
        return mockUsers;
    },
};
