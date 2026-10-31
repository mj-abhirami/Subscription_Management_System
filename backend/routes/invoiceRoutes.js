const router = require("express").Router();
const c = require("../controllers/invoiceController");
const { authenticate, authorize } = require("../middleware/auth");
router.use(authenticate);
router.get("/", c.list);
router.post("/", c.createManual);
router.post("/generate-due", authorize("admin","staff"), c.generateDue);
module.exports = router;
