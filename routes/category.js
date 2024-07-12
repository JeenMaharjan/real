const express = require("express");
const formidable = require("express-formidable");

const router = express.Router();
const { requireSignin } = require("../middlewares/index.js");
const { create, getAllCategory, uploadImage, removeImage, 
        videoUpload, videoRemove, addProject, categoryWithProject, getProject, updateProject, 
        deleteCategory, deleteProject } = require("../controllers/category.js");

        // Configure formidable for large file uploads
        const formidableConfig = {
          encoding: 'utf-8',
          uploadDir: 'C:/tmp', // Ensure this directory exists and is writable
          keepExtensions: true,
          maxFileSize: 1024 * 1024 * 1024 // 1GB
        };

router.post("/create-category",requireSignin, create);

router.get("/allcategory",requireSignin, getAllCategory);
router.post("/project/upload-image/:slug", formidable(), uploadImage);
router.post("/project/remove-image", removeImage);
router.post(
    "/project/upload-video/:slug",
    
    formidable(formidableConfig),
    videoUpload
  );
router.post("/project/remove-video",  videoRemove);
router.post("/addproject/:id", requireSignin , addProject);
router.put("/updateproject/:id/:slug", requireSignin  , updateProject);
router.get("/categorywithproject", categoryWithProject);
router.get("/project/view/:slug", getProject);
router.delete("/category/delete/:id", requireSignin , deleteCategory);
router.put("/project/delete/:catid/:projectid", requireSignin , deleteProject);
module.exports = router;