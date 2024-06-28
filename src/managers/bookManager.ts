import { Book } from "../objects/book";
import { Filter } from "../objects/filter";
import Database, { Database as DatabaseType, SqliteError,Statement } from 'better-sqlite3';

import dotenv from 'dotenv';
dotenv.config();
const databaseName: string = process.env.DATABASE_NAME!;

export class BookManager {

    private bookDatabase: DatabaseType;
    private readonly validFields: string[] = ['id', 'title', 'author', 'genre', 'yearPublished'] as const;

    constructor() {
        this.bookDatabase = new Database(databaseName);
        const initQuery: Statement = this.bookDatabase.prepare(`
        CREATE TABLE IF NOT EXISTS books (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            author TEXT NOT NULL,
            genre TEXT,
            yearPublished INTEGER
        );`);
        initQuery.run();
    }

    addBook(book: Book): void {
        const query: string = `INSERT INTO books (title, author, genre, yearPublished) VALUES ($title, $author, $genre, $yearPublished);`
        this.bookDatabase.prepare(query).run(book.toJSON());
    }

    getBooks(field: string, filter: Filter, value: string): Book[] {
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
                return[];
        }
        const runResult = this.bookDatabase.prepare(query).all(value) as {title: string, author: string, genre: string, yearPublished: number}[];
        return runResult.map(row => new Book(row.title, row.author, row.genre, row.yearPublished));
    } 

    getAllBooks(): Book[] {
        const query: string = `SELECT * FROM books;`;
        const runResult = this.bookDatabase.prepare(query).all() as {title: string, author: string, genre: string, yearPublished: number}[];
        return runResult.map(row => new Book(row.title, row.author, row.genre, row.yearPublished));
    }

    isValidField(field: string): boolean {
        return this.validFields.includes(field)
    }
}