const express = require("express");
const router = express.Router({ mergeParams: true });
const UsersMoney = require("../models/UsersMoney");
const auth = require("../middleware/auth.middleware");

router
  .route("/")
  .get(auth, async (req, resp) => {
    try {
      const { orderBy, equalTo } = req.query;

      if (equalTo === req.user._id) {
        const list = await UsersMoney.find({ [orderBy]: equalTo });

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
      const newAccount = await UsersMoney.create({
        ...req.body,
        userId: req.user._id,
      });

      resp.status(201).send(newAccount);
    } catch (error) {
      resp.status(500).json({ message: "Server has error please try later" });
    }
  });

router.delete("/:accountId", auth, async (req, resp) => {
  try {
    const { accountId } = req.params;

    const account = await UsersMoney.findById(accountId);

    if (account.userId.toString() === req.user._id) {
      await account.remove();
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

router.patch("/:accountId", auth, async (req, resp) => {
  try {
    const { accountId } = req.params;

    const account = await UsersMoney.findById(accountId);

    if (account.userId.toString() === req.user._id) {
      const updatedAccount = await UsersMoney.findByIdAndUpdate(
        accountId,
        req.body,
        { new: true }
      );

      resp.send(updatedAccount);
    } else {
      resp.status(401).json({ error: { message: "Unauthorized", code: 401 } });
    }
  } catch (error) {
    resp.status(500).json({ message: "Server has error please try later" });
  }
});

module.exports = router;
