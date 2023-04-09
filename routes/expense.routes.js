const express = require("express");
const router = express.Router({ mergeParams: true });
const Expense = require("../models/Expense");
const auth = require("../middleware/auth.middleware");

router
  .route("/")
  .get(auth, async (req, resp) => {
    try {
      const { orderBy, equalTo } = req.query;

      if (equalTo === req.user._id) {
        const list = await Expense.find({ [orderBy]: equalTo });

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
      const newExpense = await Expense.create({
        ...req.body,
        userId: req.user._id,
      });

      resp.status(201).send(newExpense);
    } catch (error) {
      resp.status(500).json({ message: "Server has error please try later" });
    }
  });

router.delete("/:expenseId", auth, async (req, resp) => {
  try {
    const { expenseId } = req.params;

    const expense = await Expense.findById(expenseId);

    if (expense.userId.toString() === req.user._id) {
      await expense.remove();
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

router.patch("/:expenseId", auth, async (req, resp) => {
  try {
    const { expenseId } = req.params;

    const expense = await Expense.findById(expenseId);
    console.log(expense);
    if (expense.userId.toString() === req.user._id) {
      const updatedExpense = await Expense.findByIdAndUpdate(
        expenseId,
        req.body,
        { new: true }
      );

      resp.send(updatedExpense);
    } else {
      resp.status(401).json({ error: { message: "Unauthorized", code: 401 } });
    }
  } catch (error) {
    resp.status(500).json({ message: "Server has error please try later" });
  }
});

module.exports = router;
