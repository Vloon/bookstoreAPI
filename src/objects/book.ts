export class Book {
    title: string;
    author: string;
    genre: string;
    yearPublished: number;

    constructor(title: string, author: string, genre: string, yearPublished: number) {
        this.title = title;
        this.author = author;
        this.genre = genre;
        this.yearPublished = yearPublished;
    }

    toJSON(): {title: string, author: string, genre: string, yearPublished: number} {
        return {title: this.title, author: this.author, genre: this.genre, yearPublished: this.yearPublished};
    }
}