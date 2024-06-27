import express, { Application, Request, Response } from 'express';
import { createJWT, authorizeToken } from './managers/authorizationManager';
import { BookManager } from './managers/bookManager';
import { UserManager } from './managers/userManager';
import { Book, booksSQLToJSON } from './objects/book';
import { isValidFilter, Filter } from './objects/filter';

const app: Application = express();
app.use(express.json());

const PORT: number = 8080;

const userManager: UserManager = new UserManager();
const bookManager: BookManager = new BookManager();

function checkBookGetConstraints(res: Response, field: string, filter: string, value:string): void {
    if (!isValidFilter(filter)) 
        res.status(400).send(`Invalid filter ${filter}`);
    if (!bookManager.isValidField(field)) 
        res.status(400).send(`Invalid field ${field}`);
}

function checkValidLogin(isValid: boolean, req: Request, res: Response) {
    if (isValid) { // Successful login
        const accessToken: string = createJWT(req.body);
        res.status(201).json({ accessToken: accessToken }); 
    } else {
        res.status(403).send('Invalid username or password'); // Invalid login credentials
    }
}
/**
 * USER RELATED END-POINTS
 */
// Userful to have for now, not for the final product
app.get('/users', authorizeToken, (req: Request, res: Response) => {
    userManager.getAllUsers((err, rows) => {
        if (err)
            res.sendStatus(500);
        else
            res.status(200).json(rows);
    });
});

app.post('/users/register', (req: Request, res: Response) => {
    userManager.addUser(req.body, (err: Error) => {
        if (err)  
            res.status(500).send(err.message); // Database problems
        else
            res.status(201).send(`Created user with username ${req.body.username}`); // Succesful registration
    }, (err: Error) => res.status(500).send(err.message));
});

app.post('/users/login', (req: Request, res: Response) => {
    userManager.getUser(req.body.username, (err: Error, row: undefined|{username: string, password: string}) => { 
        if (err) {
            console.log(err);
            res.status(500).send(err.message); // Something went wrong during the database reading
        }
        else {
            if (row == null) 
                res.status(403).send('Invalid username or password') // Invalid login credentials
            else { // User is in database
                userManager.validateUser(req.body.password, row.password)
                .then((isValid: boolean) => checkValidLogin(isValid, req, res))
                .catch((err: Error) => res.status(500).send(err.message)); // Server side error while hashing
            }
        }
    });
});

/**
 * BOOK-RELATED ENDPOINTS
 */
app.post('/books', authorizeToken, (req: Request<any, any, any, {title: string, author: string, genre: string, yearPublished: string}>, res: Response) => {
    const title: string = req.query.title;
    const author: string = req.query.author;
    const genre: string = req.query.genre;
    const _yearPublished: string = req.query.yearPublished;
    const yearPublished: number = parseFloat(_yearPublished);
    if (isNaN(yearPublished))
        res.status(400).send(`Invalid yearPublished value "${_yearPublished}"`);
    else {
        const book: Book = new Book(title, author, genre, yearPublished);
        bookManager.addBook(book, (err: Error) => {
            if (err)
                res.status(500).send(err.message);
            else
                res.status(200).send(`Book ${book.title} added`);
        })
    }
});

app.get('/books/all', authorizeToken, (req: Request, res: Response) => {    
    bookManager.getAllBooks((err: Error, rows: {id: number, title: string, author: string, genre: string, yearPublished: number}[]) => {
        if (err)
            res.status(500).send(err.message);
        else {
            const jsonRows = booksSQLToJSON(rows);
            res.status(200).send(jsonRows);
        }
    });
});

app.get('/books', authorizeToken, (req: Request<any, any, any, {field: string, filter: string, value: string}>, res: Response) =>  {
    const field: string = req.query.field;
    let filter: string = req.query.filter;
    let value: string = req.query.value;
    checkBookGetConstraints(res, field, filter, value);
    filter = filter as Filter;

    bookManager.getBooks(field, filter, value, (err: Error, rows: {id: number, title: string, author: string, genre: string, yearPublished: number}[]) => {
        if(err)
            res.status(500).send(err.message);
        else {           
            const jsonRows = booksSQLToJSON(rows);
            res.status(200).send(jsonRows);
        }
    });
});

app.listen(PORT)