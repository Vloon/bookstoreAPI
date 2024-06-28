import dotenv from 'dotenv';
dotenv.config();
import { NextFunction, Request, Response } from 'express';

import jwt from 'jsonwebtoken';
import { User } from '../objects/user';

const ACCESS_TOKEN_KEY: string = process.env.ACCESS_TOKEN_KEY!;

export function createJWT(user: User): string {
    const accessToken = jwt.sign(user.toObject(), ACCESS_TOKEN_KEY);
    return accessToken;
}

/**
 * Middelware function to authorize the request based on the JWT. The JWT is found in the request's header.
 * It has the form: "Bearer token1234..." hence we split the string on a space and take the 2nd element.
 * @param req the client's request
 * @param res the response 
 * @param next the next function
 */
export function authorizeToken(req: Request, res: Response, next: NextFunction): void {
    const authorizationHeader = req.headers['authorization'];
    const token = authorizationHeader?.split(' ')[1];
    if (token == null)
        res.status(400).send('No token sent');
    else {
        jwt.verify(token, ACCESS_TOKEN_KEY, (err, _) => {
            if (err)
                res.status(403).send('Invalid token sent');
            else
                next();
        });
    }
}
