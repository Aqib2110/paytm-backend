"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Middleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("./config"));
// @ts-ignore
const Middleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: "Authorization header missing" });
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: "Token missing" });
    }
    try {
        const verifiedUser = jsonwebtoken_1.default.verify(token, config_1.default);
        if (verifiedUser) {
            // @ts-ignore
            req.userId = verifiedUser._id;
            next();
        }
    }
    catch (error) {
        return res.status(403).json({ error: "Invalid or expired token" });
    }
};
exports.Middleware = Middleware;
