import { Book } from "../objects/book";
import { Filter } from "../objects/filter";
import sqlite3, { Database } from "sqlite3";
sqlite3.verbose();

import dotenv from 'dotenv';
dotenv.config();
const databaseName: string = process.env.DATABASE_NAME!;

export class BookManager {

    private bookDatabase: Database;
    private readonly validFields: string[] = ['id', 'title', 'author', 'genre'] as const;

    constructor() {
        this.bookDatabase = new Database(databaseName);
        const initQuery = `
        CREATE TABLE IF NOT EXISTS books (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            author TEXT NOT NULL,
            genre TEXT,
            yearPublished INTEGER
        );`;
        this.bookDatabase.run(initQuery, (err) => {
            if (err)
                console.error(err.message);
        });
    }

    addBook(book: Book, callback: (err: Error) => void) {
        const query: string = `INSERT INTO books (title, author, genre, yearPublished) VALUES ($title, $author, $genre, $yearPublished);`
        this.bookDatabase.run(query, book.toSQLObject(), callback);
    }

    getBooks(field: string, filter: Filter, value: string, callback: (err: Error, rows: Array<any>) => void) {
        let query: string;
        switch (filter) {
            case '=':
            case 'is':
                query = `SELECT * FROM books WHERE ${field} = ?;`;
                break;
            case 'contains':
                value = `%${value}%`;
                query = `SELECT * FROM books WHERE ${field} LIKE ?;`;
                break;
            default:
                return;
        }
        this.bookDatabase.all(query, [value], callback);
    } 

    getAllBooks(callback: (err: Error, rows: {id: number, title: string, author: string, genre: string, yearPublished: number}[]) => void) {
        const query: string = `SELECT * FROM books;`;
        this.bookDatabase.all(query, callback);
    }

    isValidField(field: string): boolean {
        return this.validFields.includes(field)
    }
}