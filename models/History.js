const { Schema, model } = require("mongoose");

const schema = new Schema(
  {
    account: { type: Schema.Types.ObjectId, ref: "UsersMoney", required: true },
    amount: Number,
    comment: { type: String },
    currency: { type: String },
    date: { type: String },
    item: { type: Schema.Types.ObjectId, ref: "Expense" },
    name: { type: String },
    timeStamp: Number,
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
  }
);

module.exports = model("History", schema);
