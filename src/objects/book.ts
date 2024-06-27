export class Book {
    title: string;
    author: string;
    genre: string;
    yearPublished: number;
    id?: number;

    constructor(title: string, author: string, genre: string, yearPublished: number) {
        this.title = title;
        this.author = author;
        this.genre = genre;
        this.yearPublished = yearPublished;
    }
    
    toSQLObject(): {$title: string, $author: string, $genre: string, $yearPublished: number} {
        return {$title: this.title, $author: this.author, $genre: this.genre, $yearPublished: this.yearPublished};
    }

    toJSON(): {title: string, author: string, genre: string, yearPublished: number} {
        return {title: this.title, author: this.author, genre: this.genre, yearPublished: this.yearPublished};
    }
}

export function booksSQLToJSON(rows: {id: number, title: string, author: string, genre: string, yearPublished: number}[]): {title: string, author: string, genre: string, yearPublished: number}[] {
    return rows.map((row) => {
        const book: Book = new Book(row.title, row.author, row.genre, row.yearPublished);
        return book.toJSON()
    });
}