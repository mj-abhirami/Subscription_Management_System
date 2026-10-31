const router = require("express").Router();
const c = require("../controllers/discountController");
const { authenticate, authorize } = require("../middleware/auth");
router.use(authenticate);
router.get("/", c.list);
router.post("/", authorize("admin","staff"), c.create);
module.exports = router;
