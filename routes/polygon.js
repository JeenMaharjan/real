const express = require("express");
const router = express.Router();

const { requireSignin } = require("../middlewares/index.js");
const {uploadPolygon , AllPolygon , deletePolygon ,polygon , updatePolygon} = require("../controllers/polygon.js");

router.post("/upload-polygon",  requireSignin , uploadPolygon);
router.get("/all-polygon" , AllPolygon);
router.delete("/delete-polygon/:slug", requireSignin , deletePolygon);
router.get("/polygon/:slug" , polygon);
router.put("/update-polygon/:slug",  requireSignin , updatePolygon);

module.exports = router;
