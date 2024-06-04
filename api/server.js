const express = require("express");
const mongoose = require('mongoose');
const dotenv = require("dotenv");

const app = express();
const cors = require("cors")
const port=process.env.PORT || 5000;
dotenv.config();


//routes


const tedarikciTalepRoute=require("./routes/tedarikciTalepleri.js")
const authRoute=require("./routes/auth.js")

const connect = async ()=> {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MONGODB");
    } catch (error) {
        // console.log(error);
       throw error
    }
}

//middlewares
app.use(express.json());
app.use(cors());


app.use("/api/tedarikciTalep",tedarikciTalepRoute)
app.use("/api/auth",authRoute)


app.listen(port,()=>{
    connect();
    console.log(`Port ${port}`);
})