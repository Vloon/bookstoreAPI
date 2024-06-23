import dotenv from 'dotenv';
dotenv.config();
import { NextFunction, Request, Response } from 'express';

import jwt from 'jsonwebtoken';


/**
 * Class with (static) functions related to JWTs and their authorization. 
 */
export class AuthorizationManager {

    static createJWT(user: { name: string, password: string }): string {
        const accessKey: string = process.env.ACCESS_TOKEN_KEY as string;
        const accessToken = jwt.sign(user, accessKey);
        return accessToken;
    }

    /**
     * Middelware function to authorize the request based on the JWT. The JWT is found in the request's header.
     * It has the form: "Bearer token1234..." hence we split the string on a space and take the 2nd element.
     * @param req the client's request
     * @param res the response 
     * @param next the next function
     */
    static authorizeToken(req: Request, res: Response, next: NextFunction): void {
        const authorizationHeader = req.headers['authorization'];
        const token = authorizationHeader?.split(' ')[1];
        if (token == null)
            res.sendStatus(400);
        else {
            const accessKey: string = process.env.ACCESS_TOKEN_KEY as string;
            jwt.verify(token, accessKey, (err, _) => {
                if (err)
                    res.sendStatus(403);
                else
                    next();
            });
        }
    }
}