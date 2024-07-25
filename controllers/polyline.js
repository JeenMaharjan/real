const Polyline = require("../models/polyline.js");
const slugify = require("slugify");
const { readFileSync } = require("fs");
const AWS = require("aws-sdk");
const { nanoid } = require("nanoid");


const awsConfig = {
    accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY,
    region: process.env.MY_REGION,
    apiVersion: process.env.AWS_API_VERSION,
  };
  
  const S3 = new AWS.S3(awsConfig);

  const uploadPolyline = async (req, res) => {
    try {
      const polylineData = req.body;
     
      // Create a new Property instance
      const newPolyline = new Polyline({
          title: polylineData.title,
          zoom: polylineData.zoom,
          desc: polylineData.desc,
          marker: polylineData.marker,
          width: polylineData.width,
          images: polylineData.images,
          color: polylineData.color,
          coordinate: polylineData.coordinate 
    

     
      });

      // Save the property to the database
      await newPolyline.save();

      // Send a response back to the client
      res.status(201).json({
          message: 'Polyline uploaded successfully',
        
      });
  } catch (error) {
      console.error(error);
      res.status(500).json({
          message: 'An error occurred while uploading the Polyline',
          error: error.message
      });
  }
  }

  const AllPolyline = async (req, res) => {
    try {
      // Fetch all properties from the database
      const polylines = await Polyline.find();

      // Send the properties as the response
      res.status(200).json(polylines);
  } catch (error) {
      console.error(error);
      res.status(500).json({
          message: 'An error occurred while fetching the properties',
          error: error.message,
      });
  }
  }

  const removeImageCat = async (params) => {
    try {
      const { Bucket, Key } = params;
      // image params
      
      // send remove request to s3
      S3.deleteObject({ Bucket, Key }, (err, data) => {
        if (err) {
          console.log(err);
          
        }
        console.log("Image deleted");
      });
    } catch (err) {
      console.log(err);
    }
  };

  const deletePolyline = async (req, res) => {
    const {slug} = req.params
    console.log(slug)
    try {
        const property = await Polyline.findOne({ _id: slug });
        if (!property) {
            return res.status(404).json({ error: 'Polyline category not found' });
        }

  

  
        // Iterate through projects and delete associated files from S3
        for (const project of property.images) {
            await removeImageCat({ Bucket: project.Bucket, Key: project.Key });
        }
  
        // Remove the entire project array (deleting all associated files)
       
  
        // Save the updated Property document
        await property.save();
  
        // Delete the entire Property category
        await property.remove();
  
        res.status(200).json({ message: 'Polyline deleted successfully' });
    } catch (error) {
        
    }
}

const polyline = async (req, res) => {
  const { slug } = req.params;
  console.log('Received slug:', slug); // Add this line for debugging
  try {
      const property = await Polyline.findById(slug);
      if (!property) {
          return res.status(404).json({ message: "Property not found" });
      }
      res.json(property);
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
  }
};

const updatePolyline = async (req, res) => {
  const { slug } = req.params; // Here, slug is actually the id
  const updateData = req.body;
 const {images : photo } = updateData 


  try {
      // Find the property by id
      const propertyforimage = await Polyline.findOne({ _id: slug });
 
      const photoKeys = photo.map(img => img.key);

      // Filter out images from propertyforimage.images that have a matching key in photo
      const updatedImages = propertyforimage.images.filter(img => !photoKeys.includes(img.key));

      
      for (const project of updatedImages) {
        await removeImageCat({ Bucket: project.Bucket, Key: project.Key });
    }

      const property = await Polyline.findByIdAndUpdate(slug, updateData, { new: true });
      if (!property) {
          return res.status(404).json({ error: 'Polyline not found' });
      }

      res.json(property);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
  }
};



  module.exports = {
    uploadPolyline , AllPolyline , deletePolyline , polyline ,updatePolyline
  };