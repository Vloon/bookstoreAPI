import { hash, compare } from "bcrypt";

const numSaltRoundsDefault: number = 10;

/**
 * Hashes the password using the bcrypt hashing function. 
 * @param password the user's unhashed password
 * @param numSaltRounds (log_2 of the) number of salt generation rounds. 
 * @returns the hashed password
 */
export async function hashPassword(password: string, numSaltRounds: number = numSaltRoundsDefault): Promise<string> {
    const hashedPassword: Promise<string> = hash(password, numSaltRounds);
    return hashedPassword;
}

export async function validatePassword(rawPassword: string, hashedPassword: string): Promise<boolean> {
    return compare(rawPassword, hashedPassword);
}
