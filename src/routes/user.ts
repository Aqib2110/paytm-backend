import express from 'express'
import zod from 'zod'
import jwt from 'jsonwebtoken';
const userrouter = express.Router();
import { Account, User } from '../db';
import { Middleware } from '../middleware';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config();
const signupSchema = zod.object({
    firstname: zod.string().min(3, "First name should be atleast three characters"),
    lastname: zod.string().min(3, "Last name should be atleast three characters"),
    username: zod.string().email().min(6, "email should be atleast six characters"),
    password: zod.string().min(6, "Password must be at least 6 characters"),
});
const signinSchema = zod.object({
    username: zod.string().email().min(6, "email should be atleast six characters"),
    password: zod.string().min(6, "Password must be at least 6 characters"),
});
const JWT_SECRET = process.env.JWT_SECRET as string;
//@ts-ignore
userrouter.post("/signup",async(req,res)=>{
const {firstname,lastname,username,password} = req.body;
const session = mongoose.startSession();
const amount = Math.ceil(Math.random() * 10000);
const parseResult = signupSchema.safeParse({ firstname, lastname, username, password });
if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.errors });
}
if(!firstname || !lastname || !password){
    return res.status(500).json({message:"All fields are required"})
}
try {
    const user = await User.findOne({
        username
    })
    if(user)
    {
res.status(401).json({exists:"username already exists"})
    }
    else
    {
(await session).startTransaction();
 const user = await User.create({
    firstname,
    lastname,
    username,
    password
});
await Account.create({
    userId:user._id,
    balance:amount
});
(await session).commitTransaction();
res.status(200).json({message:"Signup successfully"})
    }
} catch (error) {
    res.status(400).json({error:error})
}
})
//@ts-ignore
userrouter.post("/signin",async(req,res)=>{
const {username,password} = req.body;
const parseResult = signinSchema.safeParse({ username, password });
if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.errors });
}
else if(!username ||  !password){
    return res.status(500).json({message:"All fields are required"})
}
try {
    const user = await User.findOne({
    username,
    password
})
if(user)
{
   
    const token = jwt.sign(
        { _id:user._id },
        JWT_SECRET,
        { expiresIn: '1h' }
    );
    return res.status(200).json({ message: "signin Successfully", token:token });
}
else{
    res.status(202).json({invalid:"invalid credentials"})
}
} catch (error) {
        res.status(400).json({error:error})
}
}
)
const updateSchema = zod.object({
    firstname: zod.string().min(3, "First name is required").optional(),
    lastname: zod.string().min(3, "Last name is required").optional(),
    password: zod.string().min(6, "Password must be at least 6 characters").optional(),
});
//@ts-ignore
userrouter.post("/updateInfo",Middleware,async(req,res)=>{
const {firstname,lastname,password} = req.body;
//@ts-ignore
const _id = req.userId;
const ParseObj = updateSchema.safeParse(req.body);
if(!ParseObj.success)
{
return res.status(411).json({error:ParseObj.error.errors});
}
if(!firstname || !lastname || !password){
    return res.status(500).json({message:"All fields are required"});
}
try {
await User.updateOne(
    { _id:_id },      
    {
        $set: {
            firstname,
            lastname,
            password
        }
    }
)
res.status(200).json({message:"Profile updated Successfully"})
} catch (error) {
    res.status(500).json({error:error})
}
})
//@ts-ignore
userrouter.get('/bulk',Middleware,async(req,res)=>{
const query = req.query?.filter || ""; 
try {
   const users = await User.find({
    $or:[{
firstname:{
    "$regex":query
}
},
{
lastname:{
    "$regex":query
}
}]
},
{
    password:0
}
); 
res.status(200).json({ users });
} catch (error) {
res.status(500).json({ error:error });
}
})
export default userrouter;