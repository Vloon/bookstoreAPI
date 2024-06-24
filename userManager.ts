import { hashPassword, validateUser } from "./passwordManager";
import sqlite3, { Database } from "sqlite3";
sqlite3.verbose();

/**
 * Provides a number of CRUD + validation operations on the user database
 */
export class UserManager {

    // private users: { name: string, password: string }[] = []; // REPLACE WITH SQL
    private readonly databaseName: string = 'database.db';
    private userDatabase: Database;

    constructor() {
        this.userDatabase = new Database(this.databaseName);
        const initQuery = `
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
        );`;
        this.userDatabase.run(initQuery, (err) => {
            if (err)
                console.error(err.message);
        });
    }

    /**
     * Adds a new user. 
     * Needs callback functions for both database.run and the hashPassword function's Promise rejection. 
     * @param requestedUser The requested user to be added
     * @param callbackSQL A callback function called after adding the user to the SQL database
     * @param callbackHashError A callback function to be called when catching an error from the hashPassword function
     */
    addUser(requestedUser: { username: string, password: string }, callbackSQL: (err: Error) => void, callbackHashError: (err: Error) => void): void {
        hashPassword(requestedUser.password)
        .then((hashedPassword: string) => {
            const query: string = `INSERT INTO users (username, password) VALUES ($username, $password);`
            const user: { $username: string, $password: string } = {
                $username: requestedUser.username,
                $password: hashedPassword
            };
            this.userDatabase.run(query, user, callbackSQL);
        })
        .catch((err: Error) => callbackHashError(err));
    }

    getAllUsers(callback: (err: Error, rows: Object) => void): void {
        const query: string = `SELECT * FROM users;`;
        this.userDatabase.all(query, callback);        
    }

    /**
     * Checks whether the user is in the database, and checks whether the password is correct. 
     * @param requestedUser the user making the request
     * @param callback function to be called after the user is validated
     * @returns whether the user is  valid
     */
    validateUser(requestedUser: { $username: string, password: string }, callback: (err: Error, row: Array<Object>) => void): void {
        const query = `SELECT * FROM users WHERE username = $username`;
        this.userDatabase.get(query, requestedUser, callback);
    }
}