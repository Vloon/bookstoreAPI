import express, { Application, Request, Response } from 'express';
import { createJWT, authorizeToken } from './managers/authorizationManager';
import { BookManager } from './managers/bookManager';
import { UserManager } from './managers/userManager';
import { Book } from './objects/book';
import { isValidFilter, Filter } from './objects/filter';
import { User } from './objects/user';

const app: Application = express();
app.use(express.json());

const PORT: number = 8080;

const userManager: UserManager = new UserManager();
const bookManager: BookManager = new BookManager();

function noFieldsGiven(obj: object, keys: string[]): boolean {
    let noFields = true;   
    for (let key of keys) 
        noFields = noFields && !Object.keys(obj).includes(key);
    return noFields;
}

function allFieldsGiven(obj: object, res: Response, mandatoryKeys: string[] = []): boolean {
    for (let key of mandatoryKeys) 
        if (!Object.keys(obj).includes(key)) {
            res.status(400).send(`No value given for attribute ${key}`);
            return false;
        }
    for (let [key, value] of Object.entries(obj))  
        if (value == null) {
            res.status(400).send(`No value given for attribute ${key}`);
            return false;
        }
    return true;
}

function allValidBookGetConstraints(res: Response, query: {field: string, filter: string, value: string}): boolean {
    if (!isValidFilter(query.filter)) {
        res.status(400).send(`Invalid filter ${query.filter}`);
        return false;
    }
    if (!bookManager.isValidField(query.field)) {
        res.status(400).send(`Invalid field ${query.field}`);
        return false;
    }
    return true;
}

function checkValidLogin(isValid: boolean, user: User, res: Response): void {
    if (isValid) { 
        const accessToken: string = createJWT(user);
        res.status(201).json({ accessToken: accessToken });
    } else {
        res.status(403).send('Invalid username or password'); 
    }
}
/**
 * USER RELATED END-POINTS
 */
// Userful to have for now, not for the final product
app.get('/users', authorizeToken, (req: Request, res: Response) => {
    try {
        res.status(200).json(userManager.getAllUsers());
    } catch (err) {
        res.status(500).send(err);
    }
});

app.post('/users/register', (req: Request, res: Response) => {
    if (allFieldsGiven(req.body, res, ['username', 'password'])) {
        userManager.addUser(req.body,
            () => { res.status(201).send(`Created user "${req.body.username}"`); }, // On success
            () => { res.status(400).send(`Username "${req.body.username}" already taken`); // On error
        });
    }
});

app.post('/users/login', (req: Request, res: Response) => {
    if (allFieldsGiven(req.body, res, ['username', 'password'])) {
        const user: null | User = userManager.getUser(req.body.username);
        if (user == null) 
            res.status(403).send('Invalid username or password');
        else {
            console.log(req.body.password, user.hashedPassword);
            userManager.validatePassword(req.body.password, user.hashedPassword)
                .then((isValid: boolean) => checkValidLogin(isValid, user, res))
                .catch((err: Error) => res.status(500).send(err.message)); // Problem with hashing the password
        }
    }
});

/**
 * BOOK-RELATED ENDPOINTS
 */
app.post('/books', authorizeToken, (req: Request<any, any, any, { title: string, author: string, genre: string, yearPublished: string }>, res: Response) => {
    if (allFieldsGiven(req.query, res, ['title', 'author', 'genre', 'yearPublished'])) {
        const title: string = req.query.title;
        const author: string = req.query.author;
        const genre: string = req.query.genre;
        const _yearPublished: string = req.query.yearPublished;
        const yearPublished: number = parseFloat(_yearPublished); 
        if (isNaN(yearPublished))
            res.status(400).send(`Invalid yearPublished value "${_yearPublished}"`);
        else {
            const book: Book = new Book(title, author, genre, yearPublished);
            try {
                bookManager.addBook(book);
                res.status(200).send(`Book "${book.title}" added`);
            } catch (err) {
                res.status(500).send(`Something went wrong while getting books`);
            }
        }
    }
});

app.get('/books', authorizeToken, (req: Request<any, any, any, { field: string, filter: string, value: string }>, res: Response) => {
    const bookGetFields: string[] = ['field', 'filter', 'value'];
    if (noFieldsGiven(req.query, bookGetFields)) {
        try {
            const books: Book[] = bookManager.getAllBooks();
            res.status(200).json(books);
        } catch {
            res.status(500).send(`Something went wrong while getting books`);
        }
    }
    else if (allFieldsGiven(req.query, res, bookGetFields) && allValidBookGetConstraints(res, req.query)) {
        const field: string = req.query.field;
        const filter: Filter = req.query.filter as Filter;
        const value: string = req.query.value;
        try {
            const filteredBooks: Book[] = bookManager.getBooks(field, filter, value);
            const jsonRows = filteredBooks.map(book => book.toJSON());
            res.status(200).send(jsonRows);
        } catch {
            res.status(500).send(`Something went wrong while getting books`);
        }
    }
});

app.listen(PORT)