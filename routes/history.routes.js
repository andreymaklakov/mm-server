const express = require("express");
const router = express.Router({ mergeParams: true });
const History = require("../models/History");
const auth = require("../middleware/auth.middleware");

router
  .route("/")
  .get(auth, async (req, resp) => {
    try {
      const { orderBy, equalTo } = req.query;

      if (equalTo === req.user._id) {
        const list = await History.find({ [orderBy]: equalTo });

        resp.send(list);
      } else {
        return resp
          .status(401)
          .json({ error: { message: "Unauthorized", code: 401 } });
      }
    } catch (error) {
      resp.status(500).json({ message: "Server has error please try later" });
    }
  })
  .post(auth, async (req, resp) => {
    try {
      const newHistory = await History.create({
        ...req.body,
        userId: req.user._id,
      });

      resp.status(201).send(newHistory);
    } catch (error) {
      resp.status(500).json({ message: "Server has error please try later" });
    }
  });

router.delete("/:historyId", auth, async (req, resp) => {
  try {
    const { historyId } = req.params;

    const histroy = await History.findById(historyId);

    if (histroy.userId.toString() === req.user._id) {
      await histroy.remove();
      return resp.send(null);
    } else {
      return resp
        .status(401)
        .json({ error: { message: "Unauthorized", code: 401 } });
    }
  } catch (error) {
    resp.status(500).json({ message: "Server has error please try later" });
  }
});

module.exports = router;
