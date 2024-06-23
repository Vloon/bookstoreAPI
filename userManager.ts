import { PasswordManager } from "./passwordManager";


export class UserManager {

    private users: { name: string, password: string }[] = []; // REPLACE WITH SQL

    async addUser(requestedUser: { name: string, password: string }): Promise<{ name: string, password: string }> {
        const hashedPassword: string = await PasswordManager.hashPassword(requestedUser.password);
        const user: { name: string, password: string } = {
            "name": requestedUser.name,
            "password": hashedPassword
        };
        this.users.push(user); // REPLACE WITH SQL
        return user
    }

    getUsers() {
        return this.users;
    }

    /**
     * Checks whether the user is in the database, and checks whether the password is correct. 
     * @param requestedUser the user making the request
     * @returns whether the user is  valid
     */
    validateUser(requestedUser: { name: string, password: string }): Promise<boolean> {
        const userFromDatabase: { name: string, password: string } | undefined = this.users.find(user => user.name === requestedUser.name);
        if (userFromDatabase === undefined) return Promise.resolve(false); // No user found with this username
        const isValid: Promise<boolean> = PasswordManager.validateUser(requestedUser, userFromDatabase);
        return isValid;
    }
}