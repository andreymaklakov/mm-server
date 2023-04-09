const { Schema, model } = require("mongoose");

const schema = new Schema(
  {
    amount: Number,
    currency: { type: String },
    expenseTimeStamp: Number,
    icon: { type: String },
    name: { type: String },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
  }
);

module.exports = model("Expense", schema);
