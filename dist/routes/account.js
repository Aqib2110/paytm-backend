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
const accountrouter = express_1.default.Router();
const db_1 = require("../db");
const middleware_1 = require("../middleware");
const mongoose_1 = __importDefault(require("mongoose"));
accountrouter.get("/balance", middleware_1.Middleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //@ts-ignore
        const id = req.userId;
        const account = yield db_1.Account.findOne({
            userId: id
        }).populate({
            path: "userId",
            select: "-password"
        });
        res.status(200).json({ balance: account === null || account === void 0 ? void 0 : account.balance, user: account === null || account === void 0 ? void 0 : account.userId });
    }
    catch (error) {
        res.status(500).json({ error: error });
    }
}));
//@ts-ignore
accountrouter.post("/transfer", middleware_1.Middleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    try {
        (yield session).startTransaction();
        //@ts-ignore
        const senderId = req.userId;
        const { receiverId, amount } = req.body;
        //@ts-ignore
        const account = yield db_1.Account.findOne({ userId: senderId }).session(session);
        if (!account || account.balance < amount) {
            (yield session).abortTransaction();
            return res.status(400).json({ invalid: "Insufficient Balance" });
        }
        //@ts-ignore
        const toaccount = yield db_1.Account.findOne({ userId: receiverId }).session(session);
        if (!toaccount) {
            (yield session).abortTransaction();
            return res.status(400).json({ invalid: "Invalid Account" });
        }
        //@ts-ignore
        yield db_1.Account.updateOne({ userId: senderId }, { $inc: { balance: -amount } }).session(session);
        //@ts-ignore
        yield db_1.Account.updateOne({ userId: receiverId }, { $inc: { balance: amount } }).session(session);
        (yield session).commitTransaction();
        res.status(200).json({ message: "Money Transferred Successfully" });
    }
    catch (error) {
        (yield session).abortTransaction();
        console.log(error);
        res.status(500).json({ error: error });
    }
}));
exports.default = accountrouter;
