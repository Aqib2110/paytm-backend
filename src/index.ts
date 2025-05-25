import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import cors from 'cors'
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
dotenv.config();
app.use(cors());
const MONGOURI = process.env.MONGOURI as string;
mongoose.connect(MONGOURI,{
  useNewUrlParser: true,
  useUnifiedTopology: true,
  connectTimeoutMS: 60000,
  socketTimeoutMS: 60000,
  serverSelectionTimeoutMS: 60000,
})
.then(()=>console.log("connected to mongodb"))
.catch((err)=>console.log(err));
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
app.use(
  cors({
    origin:FRONTEND_URL,
    methods: "GET,POST,PUT,DELETE,OPTIONS",
    allowedHeaders: "Content-Type, Authorization",
    credentials: true
  })
);
import userrouter from './routes/user';
import accountrouter from './routes/account';


app.use("/api/v1/user",userrouter);
app.use("/api/v1/account",accountrouter);

app.listen(3000);




