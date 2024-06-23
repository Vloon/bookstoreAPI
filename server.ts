import express, { Application, Request, Response } from 'express';
import { AuthorizationManager } from './authorizationManager';
import { UserManager } from './userManager';

const app: Application = express();
app.use(express.json());

const PORT: number = 8080;

const userManager: UserManager = new UserManager();

// Delete this later
app.get('/users', AuthorizationManager.authorizeToken, (req: Request, res: Response) => {
    res.status(200).json(userManager.getUsers());
});

app.post('/users/register', async (req: Request, res: Response) => {
    try {
        const user: { name: string, password: string } = await userManager.addUser(req.body);
        res.status(201).send(`Created user with username ${user.name}`);
    } catch {
        res.status(500).send('Something went wrong while creating a new user');
    }
});

app.post('/users/login', async (req: Request, res: Response) => {
    try {
        if (await userManager.validateUser(req.body)) {
            const accessToken: string = AuthorizationManager.createJWT(req.body);
            res.status(201).json({ accessToken: accessToken }); // Successful login
        } else {
            res.status(403).send('Invalid username or password'); // Bad login
        }
    } catch {
        res.status(500).send('Something went wrong while logging in'); // Server side error
    }
});

app.listen(PORT)