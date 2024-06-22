const mongoose = require("mongoose");

const UserSchema = mongoose.Schema(
    {
        username:{type:String,require:true},
        email:{type:String,require:true,unique:true},
        password:{type:String,require:true},
        active:{type:Boolean,default:true},
        deleted:{type:Boolean,default:false},
    },
    {timestamps:true}
)

const User = mongoose.model("users",UserSchema);

module.exports = User;