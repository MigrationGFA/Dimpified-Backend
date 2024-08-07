const express = require("express");
const path = require("path");
const router = express.Router();
const {
  aboutEcosystem,
  ecosystemDelete,
  allEcosystemCourses,
  getMyEcosystem,
  creatorEcosystemDashboardOverview,
  creatorEcosystemSummary,
} = require("../controllers/EcosystemController/createEcosystem");

const multer = require("multer");
const {
  createEcoCertificate,
  updateEcoCertificate,
} = require("../controllers/EcosystemController/ecosystemCertificate");
const generateUserCertificate = require("../controllers/EcosystemController/enduserCertificate");
const {
  getAllEcosystemProduct,
  getAllEcosystemStudent,
  getOrders,
  ecosystemDashboard,
  getProductOrder,
  bestSellingProducts,
  

} = require("../controllers/EcosystemController/ecosystemDashboard");
const { getEcosystemUserDashboardData, getTotalPurchasedProductsPerMonth, getLastFourPurchasedProducts } = require("../controllers/UserController/Dashboard/EcosystemUserDashboard");
const { getMyProductPage, productPayOut } = require("../controllers/UserController/Dashboard/EcosystemUserProductPage");


// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // specify the uploads folder
  },
  filename: function (req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

// Initialize upload variable
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 104857600, // 100MB
  },
});

const cpUpload = upload.fields([
  { name: "logoUrl", maxCount: 1 },
  { name: "backgroundImageUrl", maxCount: 1 },
]);

router.post("/ecosystem/aboutDetails", aboutEcosystem);

// router.post("/ecosystem/course", upload.single("image"), ecosystemCourse);
router.put("/ecosystem/delete", ecosystemDelete);

//Route to get all ecosystem courses
router.get("/ecosystem/get-all-courses/:ecosystemId", allEcosystemCourses);

// to get creator ecosystems
router.get("/creator-ecosystems/:userId", getMyEcosystem);

//To create ecosystem certificate
router.post("/create-ecosystem-certificate", cpUpload, createEcoCertificate);
router.put("/update-ecosystem-certificate/:id", cpUpload, updateEcoCertificate);

//To Create End-User Certificate
router.post("/generate-user-certificate", generateUserCertificate);
// to get all the Dashboard stats
router.get(
  "/creator/my-dashboard-overview/:creatorId",
  creatorEcosystemDashboardOverview
);

// to get he creator ecosystem summary
router.get("/creator/my-ecosystem/:creatorId", creatorEcosystemSummary);

//get ecosystem dashboard
router.get("/ecosystem-products/:ecosystemDomain", getAllEcosystemProduct);
router.get("/ecosystem-students/:ecosystemDomain", getAllEcosystemStudent);
router.get("/ecosystem-orders/:ecosystemDomain", getOrders);
router.get("/ecosystem-dashboard/:ecosystemDomain", ecosystemDashboard);
router.get("/ecosystem-product-orders/:ecosystemDomain", getProductOrder);
router.get("/ecosystem-best-selling-products/:ecosystemDomain", bestSellingProducts);

//Ecosystem User Routes
//Ecosystem User Dashboard
router.get("/ecosystem-user-dashboard/:userId/:ecosystemDomain", getEcosystemUserDashboardData);
router.get("/ecosystem-user-monthly-product-purchase/:userId/:ecosystemDomain", getTotalPurchasedProductsPerMonth)
router.get("/ecosystem-user-last-four-product/:userId/:ecosystemDomain", getLastFourPurchasedProducts)

//My product page routes
router.get("/ecosystem-user-product-page/:userId/:ecosystemDomain", getMyProductPage)
//Product PayOut
router.get("/ecosystem-user-purchase-payout/:userId/:ecosystemDomain", productPayOut)


module.exports = router;
