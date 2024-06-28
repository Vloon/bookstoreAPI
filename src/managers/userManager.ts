import { hashPassword, validatePassword } from "./passwordManager";
import { User } from '../objects/user';
import Database, { Database as DatabaseType, SqliteError, Statement } from 'better-sqlite3';

import dotenv from 'dotenv';
dotenv.config();
const databaseName: string = process.env.DATABASE_NAME!;

/**
 * Provides a number of CRUD + validation operations on the user database
 */
export class UserManager {

    private userDatabase: DatabaseType;

    constructor() {
        this.userDatabase = new Database(databaseName);
        const initQuery: Statement = this.userDatabase.prepare(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            hashedPassword TEXT NOT NULL
        );`);
        initQuery.run();
    }

    /**
     * Adds a new user. 
     * Needs callback functions for both database.run and the hashPassword function's Promise rejection. 
     * @param requestedUser The requested user to be added
     * @param callbackSQLError A callback function to be called when catching an error from the hashPassword function
     */
    addUser(requestedUser: { username: string, password: string }, callbackSQLSuccess: () => void, callbackSQLError: () => void): void {
        hashPassword(requestedUser.password)
            .then((hashedPassword: string) => {
                const query: string = `INSERT INTO users (username, hashedPassword) VALUES (?, ?);`
                this.userDatabase.prepare(query).run(requestedUser.username, hashedPassword); // Throws an error if e.g. username already exists
                callbackSQLSuccess();
            })
            .catch((err) => {if(err) callbackSQLError();});
    }

    getAllUsers(): User[] {
        const query: string = `SELECT * FROM users;`;
        const rows: { username: string, hashedPassword: string }[] = this.userDatabase.prepare(query).all() as { username: string, hashedPassword: string }[];
        const allUsers: User[] = rows.map((row) => new User(row.username, row.hashedPassword));
        return allUsers;
    }

    getUser(requestedUsername: string): null | User { // : User {
        const query = `SELECT * FROM users WHERE username = ?`;
        const row: { username: string, hashedPassword: string } = this.userDatabase.prepare(query).get(requestedUsername) as { username: string, hashedPassword: string };
        if (row == null)
            return null;
        return new User(row.username, row.hashedPassword);
    }

    validatePassword(password: string, hashedPassword: string): Promise<boolean> {
        return validatePassword(password, hashedPassword);
    }
}