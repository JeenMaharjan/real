const mongoose = require("mongoose");

const { Schema } = mongoose;

const propertySchema = new Schema({
    title: {
        type: String,
        trim: true,
        required: "Name is required",
        
    },

    maplink: {
        type: String,
        trim: true,
     
        
    },
    slug: {
        type: String,
        
        lowercase: true,
        index: true,
    
    },
    desc: {
        type: String,
        trim: true,
        required: true,

    },
    video: {
        type: Object, // Adjust the type if necessary based on your data structure
    },
    location: {
        type: String,
        trim: true,
        required: true,
        
    },
    images: {
        type: Array,
    },

    sold:{
        type:Boolean,
        default:false
    },

    color:{
        type: String,
        trim: true,
    },

    coordinate:{
        type: Array,
    }
    
}, { timestamps: true });


module.exports = mongoose.model("Property", propertySchema);