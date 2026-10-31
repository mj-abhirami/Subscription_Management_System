const router = require("express").Router();
const c = require("../controllers/subscriptionController");
const { authenticate, authorize } = require("../middleware/auth");
router.use(authenticate);
router.get("/", c.list);
router.post("/", c.create);
router.patch("/:id/status", c.updateStatus);
module.exports = router;
