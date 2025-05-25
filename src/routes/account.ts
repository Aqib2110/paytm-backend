import express from 'express'
const accountrouter = express.Router();
import { Account } from '../db';
import { Middleware } from '../middleware';
import mongoose from 'mongoose';
accountrouter.get("/balance",Middleware,async(req,res)=>{
    try {
     //@ts-ignore
const id = req.userId;
const account = await Account.findOne({
    userId:id
}).populate({
    path: "userId",
    select: "-password"
    });
res.status(200).json({balance:account?.balance,user:account?.userId})   
    } catch (error) {
     res.status(500).json({error:error})      
    }
})
//@ts-ignore
accountrouter.post("/transfer",Middleware,async(req,res)=>{
    const session = await mongoose.startSession();
try {
(await session).startTransaction();
//@ts-ignore
const senderId = req.userId;
const {receiverId,amount} = req.body;
//@ts-ignore
const account = await Account.findOne({userId:senderId}).session(session);
if(!account || account.balance < amount)
{
(await session).abortTransaction();
return res.status(400).json({invalid:"Insufficient Balance"});   
}
//@ts-ignore
const toaccount = await Account.findOne({userId:receiverId}).session(session);
if(!toaccount)
{
(await session).abortTransaction();
return res.status(400).json({invalid:"Invalid Account"});   
}
//@ts-ignore
 await Account.updateOne({userId:senderId},{$inc:{balance : -amount }}).session(session);
 //@ts-ignore
 await Account.updateOne({userId:receiverId},{$inc:{balance : amount }}).session(session);

(await session).commitTransaction();
res.status(200).json({message:"Money Transferred Successfully"});   
} catch (error) {
    (await session).abortTransaction();
    console.log(error);
res.status(500).json({error:error})      
}
})
export default accountrouter;