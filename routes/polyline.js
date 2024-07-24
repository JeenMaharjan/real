const express = require("express");
const router = express.Router();

const { requireSignin } = require("../middlewares/index.js");
const {uploadPolyline , AllPolyline , deletePolyline , polyline , updatePolyline} = require("../controllers/polyline.js");

router.post("/upload-polyline",  requireSignin , uploadPolyline);
router.get("/all-polyline" , AllPolyline);
router.delete("/delete-polyline/:slug", requireSignin , deletePolyline);
router.get("/polyline/:slug" , polyline);
router.put("/update-polyline/:slug",  requireSignin , updatePolyline);

module.exports = router;
