const mongoose = require("mongoose");

const { Schema } = mongoose;

const polygonSchema = new Schema({
    title: {
        type: String,
        trim: true,
        required: "Name is required",
        
    },


 
    desc: {
        type: String,
        trim: true,
 

    },
    

    images: {
        type: Array,
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


module.exports = mongoose.model("Polygon", polygonSchema);