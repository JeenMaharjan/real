const mongoose = require("mongoose");

const { Schema } = mongoose;

const polylineSchema = new Schema({
    title: {
        type: String,
        trim: true,
        required: "Name is required",
        
    },


 
    desc: {
        type: String,
        trim: true,
        required: true,

    },
    

    images: {
        type: Array,
    },

    width: {
        type: Number,
        trim: true,
       

    },

    color:{
        type: String,
        trim: true,
    },

    marker:{
        type: Array,
    } , 

    coordinate:{
        type: Array,
    }
    
}, { timestamps: true });


module.exports = mongoose.model("Polyline", polylineSchema);