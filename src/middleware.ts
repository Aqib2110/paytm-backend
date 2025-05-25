import { RequestHandler } from "express";
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv';
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET as string;
 // @ts-ignore
export const Middleware: RequestHandler = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: "Authorization header missing" });
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: "Token missing" });
    }
    try {
        const verifiedUser = jwt.verify(token, JWT_SECRET) as { _id: string };
        if(verifiedUser){
        // @ts-ignore
        req.userId = verifiedUser._id;
        next();
        }  
    } catch (error) {
        return res.status(403).json({ error: "Invalid or expired token" });
    }
};