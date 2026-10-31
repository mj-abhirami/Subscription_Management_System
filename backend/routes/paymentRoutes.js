const router = require("express").Router();
const c = require("../controllers/paymentController");
const { authenticate } = require("../middleware/auth");
router.use(authenticate);
router.get("/", c.list);
router.post("/", c.create);
module.exports = router;
