const { Schema, model } = require("mongoose");

const schema = new Schema(
  {
    amount: Number,
    currency: { type: String },
    accountTimeStamp: Number,
    name: { type: String },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
  }
);

module.exports = model("UsersMoney", schema);
