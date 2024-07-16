const Property = require("../models/property.js");
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

  const uploadProperty = async (req, res) => {
    try {
        const propertyData = req.body;
        const slug = slugify(propertyData.title);
        // Create a new Property instance
        const newProperty = new Property({
            title: propertyData.title,
            slug: slug,
            desc: propertyData.desc,
            video: propertyData.video,
            location: propertyData.location,
            images: propertyData.images,
            color: propertyData.color,
            coordinate: propertyData.coordinate , 
            mapLink : propertyData.mapLink
        });

        // Save the property to the database
        await newProperty.save();

        // Send a response back to the client
        res.status(201).json({
            message: 'Property uploaded successfully',
          
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'An error occurred while uploading the property',
            error: error.message
        });
    }
};


const Allproperties = async (req, res) => {
  try {
      // Fetch all properties from the database
      const properties = await Property.find();

      // Send the properties as the response
      res.status(200).json(properties);
  } catch (error) {
      console.error(error);
      res.status(500).json({
          message: 'An error occurred while fetching the properties',
          error: error.message,
      });
  }
};



const property = async (req, res) => {
  const { slug } = req.params;
  console.log('Received slug:', slug); // Add this line for debugging
  try {
      const property = await Property.findById(slug);
      if (!property) {
          return res.status(404).json({ message: "Property not found" });
      }
      res.json(property);
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
  }
};

const updateProperty = async (req, res) => {
    const { slug } = req.params; // Here, slug is actually the id
    const updateData = req.body;
   const {images : photo , video} = updateData 
  

    try {
        // Find the property by id
        const propertyforimage = await Property.findOne({ _id: slug });
        console.log(propertyforimage.video)
        const photoKeys = photo.map(img => img.key);

        // Filter out images from propertyforimage.images that have a matching key in photo
        const updatedImages = propertyforimage.images.filter(img => !photoKeys.includes(img.key));
         // Extract the key from the video object
         let updatedVideo = null 
        if(propertyforimage.video){
          updatedVideo = propertyforimage.video;
        }
        
         if (video && video.Key && propertyforimage.video && propertyforimage.video.Key === video.Key) {
             updatedVideo = null; // or you can set it to {} or another value indicating it's been removed
         }
 

        // return   console.log('Updated Videos:', updatedVideo);
        // Log the filtered images for debugging
        console.log(updatedVideo)
         if(updatedVideo !== null){
          await videoRemoveCat({ Bucket: updatedVideo.Bucket, Key: updatedVideo.Key });
         }
        for (const project of updatedImages) {
          await removeImageCat({ Bucket: project.Bucket, Key: project.Key });
      }

        const property = await Property.findByIdAndUpdate(slug, updateData, { new: true });
        if (!property) {
            return res.status(404).json({ error: 'Property not found' });
        }

        res.json(property);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

const videoRemoveCat = async (params) => {
    try {
      
  
      const { Bucket, Key } = params;
      // upload to s3
      S3.deleteObject({ Bucket, Key }, (err, data) => {
        if (err) {
          console.log(err);
          
        }
        // console.log(data); // data.Key
        console.log("video deleted");
      });
    } catch (err) {
      console.log(err);
    }
  };

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


const deleteProperty = async (req, res) => {
    const {slug} = req.params
    console.log(slug)
    try {
        const property = await Property.findOne({ _id: slug });
        if (!property) {
            return res.status(404).json({ error: 'Property category not found' });
        }

  

        if (property?.video && Object.keys(property.video).length !== 0) {
          await videoRemoveCat({ Bucket: property.video.Bucket, Key: property.video.Key });
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
  
        res.status(200).json({ message: 'Property deleted successfully' });
    } catch (error) {
        
    }
}

const deleteSinglePropertyImage = async (req, res) => {
  const { slug } = req.params;
  const { images } = req.body;

  try {
    // Find the property by slug
    const property = await Property.findOne({ _id: slug });

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Filter out the image to be deleted
    const updatedImages = property.images.filter(image => image.key !== images.key);

    await removeImageCat({ Bucket: images.Bucket, Key: images.Key });

    // Update the property images
    property.images = updatedImages;

    // Save the updated property
    await property.save();

    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const list = async (req, res) => {
  console.table(req.body);
  try {
    // createdAt/updatedAt, desc/asc, 3
    const { sort, order, page , perPage } = req.body;
    const currentPage = page || 1;
  

    const products = await Property.find({ sold: false })
        .skip((currentPage - 1) * perPage)
        .populate("category")
        .populate("subs")
        .sort([
            [sort, order]
        ])
        .limit(perPage)
        .exec();
        
    res.json(products);
} catch (err) {
    console.log(err);
}
}

const listSold = async (req, res) => {
  console.table(req.body);
  try {
    // createdAt/updatedAt, desc/asc, 3
    const { sort, order, page , perPage } = req.body;
    const currentPage = page || 1;


    const products = await Property.find({ sold: true })
        .skip((currentPage - 1) * perPage)
        .populate("category")
        .populate("subs")
        .sort([
            [sort, order]
        ])
        .limit(perPage)
        .exec();
        
    res.json(products);
} catch (err) {
    console.log(err);
}
}

const getPropertyCount = async (req, res) => {
  try {

    const soldCount = await Property.countDocuments({ sold: true });
    const notSoldCount = await Property.countDocuments({ sold: false });

    res.json({  sold: soldCount, notSold: notSoldCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching property counts.' });
  }
};

const otherProperty = async (req, res) => {
  try {
    const { slug } = req.params;
    
    // Fetch up to 5 properties that are not sold and exclude the property with the given slug
    const properties = await Property.find({ 
      _id: { $ne: slug }, 
      sold: false 
    }).limit(5);
    
    return res.status(200).json(properties);
  } catch (error) {
    console.error("Error fetching properties: ", error);
    return res.status(500).json({ message: "Server error" });
  }
};

  module.exports = {
    uploadProperty , Allproperties , property , updateProperty , deleteProperty , deleteSinglePropertyImage , list , listSold
    ,getPropertyCount , otherProperty
  };