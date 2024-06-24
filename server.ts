import express, { Application, Request, Response } from 'express';
import { createJWT, authorizeToken } from './authorizationManager';
import { UserManager } from './userManager';
import { validateUser } from './passwordManager';

const app: Application = express();
app.use(express.json());

const PORT: number = 8080;

const userManager: UserManager = new UserManager();

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
    userManager.validateUser(req.body.username, (err: Error, row: any) => { // ANY!!?!
        if (err) res.status(500).send(err.message); // Something went wrong during the database reading
        else {
            if (row == null) res.status(403).send('Invalid username or password') // Invalid login credentials
            else { // User is in database
                validateUser(req.body.password, row.password)
                .then((isValid: boolean) => {
                    if (isValid) { // Successful login
                        const accessToken: string = createJWT(req.body);
                        res.status(201).json({ accessToken: accessToken }); 
                    } else {
                        res.status(403).send('Invalid username or password'); // Invalid login credentials
                    }
                }).catch((err: Error) => res.status(500).send(err.message)); // Server side error while hashing
                
            }
        }
    });
        // if (await userManager.validateUser(req.body, (a, b)=>{return})) {
        //     const accessToken: string = createJWT(req.body);
        //     res.status(201).json({ accessToken: accessToken }); // Successful login
        // } else {
        //     
        // }
        // res.status(500).send('Something went wrong while logging in'); // Server side error
});

app.listen(PORT)