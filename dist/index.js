"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
const user_1 = __importDefault(require("./routes/user"));
const account_1 = __importDefault(require("./routes/account"));
mongoose_1.default.connect("mongodb+srv://muhammadaqib29062003:aqi2110b@cluster0.zqc9b.mongodb.net/paytm")
    .then(() => console.log("connected to mongodb"))
    .catch((err) => console.log(err));
app.use("/api/v1/user", user_1.default);
app.use("/api/v1/account", account_1.default);
app.listen(3000);
