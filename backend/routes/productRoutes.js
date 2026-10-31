const router = require("express").Router();
const c = require("../controllers/productController");
const { authenticate, authorize } = require("../middleware/auth");
router.use(authenticate);
router.get("/", c.list);
router.post("/", authorize("admin","staff"), c.create);
router.put("/:id", authorize("admin","staff"), c.update);
router.delete("/:id", authorize("admin"), c.remove);
module.exports = router;
