import { genSalt, hash, compare } from "bcrypt";

const numSaltRoundsDefault: number = 10;

/**
 * Class concerned with hashing and verifying passwords
 */
export class PasswordManager {

    /**
     * Hashes the password using the bcrypt hashing function. 
     * @param password the user's unhashed password
     * @param numSaltRounds (log_2 of the) number of salt generation rounds. 
     * @returns the hashed password
     */
    static async hashPassword(password: string, numSaltRounds: number = numSaltRoundsDefault): Promise<string> {
        try {
            const salt: string = await genSalt(numSaltRounds);
            const hashedPassword: string = await hash(password, salt);
            return hashedPassword;
        } catch {
            throw new Error("An error occurred when hashing the password.");
        }
    }

    /**
     * Valides a user by checking a) whether the username exists in the users list, and b) whether the passwords match
     * @param requestedUser user information from the request
     * @param users list of all users 
     * @returns true if the requested user's info is valid, false otherwise.
     */
    static async validateUser(requestedUser: { name: string, password: string }, userFromDatabase: { name: string, password: string }): Promise<boolean> {
        return compare(requestedUser.password, userFromDatabase.password);
    }
}