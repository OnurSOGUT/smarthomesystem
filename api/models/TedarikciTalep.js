const mongoose = require("mongoose");

const TedarikciTalepSchema = mongoose.Schema(
    {
        demsayId:{type:Number,require:true},
        man:{type:String,require:true},
        manCode_MPN:{type:String,require:true},
        product_desc:{type:String,require:true},
        qty:{type:Number,require:true},
        price:{type:Number,default:0},
        tedarikciId:{type:Number,require:true},
        demsayAktarim:{type:Boolean,default:false},
        moq:{type:Number,default:0},
        leadtime:{type:String},
        datecode:{type:Number,default:0},
        note:{type:String},
        iptalTalep:{type:Boolean,default:false},
        currency:{type:String,default:'USD'},
        spq:{type:Number,default:0},
    },
    {timestamps:true}
)

const TedarikciTalep = mongoose.model("tedarikciTalepleri",TedarikciTalepSchema);

module.exports = TedarikciTalep;