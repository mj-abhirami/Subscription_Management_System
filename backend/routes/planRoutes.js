const router = require("express").Router();
const c = require("../controllers/planController");
const { authenticate, authorize } = require("../middleware/auth");
router.use(authenticate);
router.get("/", c.list);
router.post("/", authorize("admin","staff"), c.create);
router.put("/:id", authorize("admin","staff"), c.update);
module.exports = router;
