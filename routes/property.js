const express = require("express");
const router = express.Router();

const { requireSignin } = require("../middlewares/index.js");
const {uploadProperty , Allproperties , property , updateProperty , deleteProperty , deleteSinglePropertyImage , list , 
    listSold , getPropertyCount , otherProperty} = require("../controllers/property.js");

router.post("/upload-property",  requireSignin , uploadProperty);
router.put("/update-property/:slug",  requireSignin , updateProperty);
router.get("/all-properties" , Allproperties);
router.get("/property/:slug" , property);
router.get("/otherproperty/:slug" , otherProperty);
router.delete("/delete-property/:slug", requireSignin , deleteProperty);
router.put("/delete-property-photo/:slug",   deleteSinglePropertyImage);
router.post("/products", list);
router.post("/productssold", listSold);
router.get("/properties/count" , getPropertyCount);
module.exports = router;
