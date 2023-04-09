const { Schema, model } = require("mongoose");

const schema = new Schema(
  {
    currency: { type: String },
    email: { type: String, required: true, unique: true },
    name: { type: String },
    surname: { type: String },
    password: { type: String },
  },
  {
    timestamps: true,
  }
);

module.exports = model("User", schema);
