const express = require("express");
const router = express.Router({ mergeParams: true });

router.use("/auth", require("./auth.routes"));
router.use("/usersMoney", require("./usersMoney.routes"));
router.use("/expenses", require("./expense.routes"));
router.use("/history", require("./history.routes"));
router.use("/users", require("./user.routes"));

module.exports = router;
