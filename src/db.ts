import mongoose from "mongoose";
import { Schema } from "mongoose";

const userSchema = new Schema({
    firstname:{
        type:String,
        required:true
    },
     lastname:{
        type:String,
        required:true,
    },
     username:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
})

const accountSchema = new Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    balance:{
        type:Number,
        required:true
    }
})
export const User = mongoose.model("User", userSchema);
export const Account = mongoose.model("Account",accountSchema);
