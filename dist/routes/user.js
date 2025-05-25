"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const zod_1 = __importDefault(require("zod"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config"));
const userrouter = express_1.default.Router();
const db_1 = require("../db");
const middleware_1 = require("../middleware");
const mongoose_1 = __importDefault(require("mongoose"));
const signupSchema = zod_1.default.object({
    firstname: zod_1.default.string().min(3, "First name should be atleast three characters"),
    lastname: zod_1.default.string().min(3, "Last name should be atleast three characters"),
    username: zod_1.default.string().email().min(6, "email should be atleast six characters"),
    password: zod_1.default.string().min(6, "Password must be at least 6 characters"),
});
const signinSchema = zod_1.default.object({
    username: zod_1.default.string().email().min(6, "email should be atleast six characters"),
    password: zod_1.default.string().min(6, "Password must be at least 6 characters"),
});
//@ts-ignore
userrouter.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { firstname, lastname, username, password } = req.body;
    const session = mongoose_1.default.startSession();
    const amount = Math.ceil(Math.random() * 10000);
    const parseResult = signupSchema.safeParse({ firstname, lastname, username, password });
    if (!parseResult.success) {
        return res.status(400).json({ error: parseResult.error.errors });
    }
    if (!firstname || !lastname || !password) {
        return res.status(500).json({ message: "All fields are required" });
    }
    try {
        const user = yield db_1.User.findOne({
            username
        });
        if (user) {
            res.status(401).json({ exists: "username already exists" });
        }
        else {
            (yield session).startTransaction();
            const user = yield db_1.User.create({
                firstname,
                lastname,
                username,
                password
            });
            yield db_1.Account.create({
                userId: user._id,
                balance: amount
            });
            (yield session).commitTransaction();
            res.status(200).json({ message: "Signup successfully" });
        }
    }
    catch (error) {
        res.status(400).json({ error: error });
    }
}));
//@ts-ignore
userrouter.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    const parseResult = signinSchema.safeParse({ username, password });
    if (!parseResult.success) {
        return res.status(400).json({ error: parseResult.error.errors });
    }
    else if (!username || !password) {
        return res.status(500).json({ message: "All fields are required" });
    }
    try {
        const user = yield db_1.User.findOne({
            username,
            password
        });
        if (user) {
            const token = jsonwebtoken_1.default.sign({ _id: user._id }, config_1.default, { expiresIn: '1h' });
            return res.status(200).json({ message: "signin Successfully", token: token });
        }
        else {
            res.status(202).json({ invalid: "invalid credentials" });
        }
    }
    catch (error) {
        res.status(400).json({ error: error });
    }
}));
const updateSchema = zod_1.default.object({
    firstname: zod_1.default.string().min(3, "First name is required").optional(),
    lastname: zod_1.default.string().min(3, "Last name is required").optional(),
    password: zod_1.default.string().min(6, "Password must be at least 6 characters").optional(),
});
//@ts-ignore
userrouter.post("/updateInfo", middleware_1.Middleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { firstname, lastname, password } = req.body;
    //@ts-ignore
    const _id = req.userId;
    const ParseObj = updateSchema.safeParse(req.body);
    if (!ParseObj.success) {
        return res.status(411).json({ error: ParseObj.error.errors });
    }
    if (!firstname || !lastname || !password) {
        return res.status(500).json({ message: "All fields are required" });
    }
    try {
        yield db_1.User.updateOne({ _id: _id }, {
            $set: {
                firstname,
                lastname,
                password
            }
        });
        res.status(200).json({ message: "Profile updated Successfully" });
    }
    catch (error) {
        res.status(500).json({ error: error });
    }
}));
//@ts-ignore
userrouter.get('/bulk', middleware_1.Middleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const query = ((_a = req.query) === null || _a === void 0 ? void 0 : _a.filter) || "";
    try {
        const users = yield db_1.User.find({
            $or: [{
                    firstname: {
                        "$regex": query
                    }
                },
                {
                    lastname: {
                        "$regex": query
                    }
                }]
        }, {
            password: 0
        });
        res.status(200).json({ users });
    }
    catch (error) {
        res.status(500).json({ error: error });
    }
}));
exports.default = userrouter;
