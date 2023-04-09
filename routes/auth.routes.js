const express = require("express");
const router = express.Router({ mergeParams: true });
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const tokenService = require("../services/token.service");
const { check, validationResult } = require("express-validator");
const auth = require("../middleware/auth.middleware");

router.post("/signUp", [
  check("email", "INVALID_EMAIL").isEmail(),
  check("password", "Password must be at least 8 symbols long").isLength({
    min: 8,
  }),

  async (req, resp) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return resp.status(400).json({
          error: {
            message: "INVALID_EMAIL",
            code: 400,
          },
        });
      }

      const { email, password } = req.body;

      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return resp
          .status(400)
          .json({ error: { message: "EMAIL_EXISTS", code: 400 } });
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const newUser = await User.create({
        ...req.body,
        password: hashedPassword,
      });

      const tokens = tokenService.generate({ _id: newUser._id });

      await tokenService.save(newUser._id, tokens.refreshToken);

      resp.status(201).send({ ...tokens, userId: newUser._id });
    } catch (error) {
      resp.status(500).json({ message: "Server has error please try later" });
    }
  },
]);

router.post("/signInWithPassword", [
  check("email", "INVALID_EMAIL").normalizeEmail().isEmail(),
  check("password", "Password field can not be empty").exists(),

  async (req, resp) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return resp.status(400).json({
          error: {
            message: "INVALID_EMAIL",
            code: 400,
          },
        });
      }

      const { email, password } = req.body;

      const existingUser = await User.findOne({ email });

      if (!existingUser) {
        return resp.status(400).json({
          error: { message: "EMAIL_NOT_FOUND", code: 400 },
        });
      }

      const isEqual = await bcrypt.compare(password, existingUser.password);

      if (!isEqual) {
        return resp.status(400).json({
          error: { message: "INVALID_PASSWORD", code: 400 },
        });
      }

      const tokens = tokenService.generate({ _id: existingUser._id });
      await tokenService.save(existingUser._id, tokens.refreshToken);

      resp.status(200).send({ ...tokens, userId: existingUser._id });
    } catch (error) {
      resp.status(500).json({ message: "Server has error please try later" });
    }
  },
]);

router.put("/changeEmail", auth, [
  check("email", "Incorrect email").isEmail(),

  async (req, resp) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return resp.status(400).json({
          error: {
            message: "INVALID_EMAIL",
            code: 400,
          },
        });
      }

      const { email, oldEmail } = req.body;

      const user = await User.findOne({ oldEmail });

      if (!user) {
        return resp
          .status(400)
          .json({ error: { message: "EMAIL_NOT_FOUND", code: 400 } });
      }

      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return resp
          .status(400)
          .json({ error: { message: "EMAIL_EXISTS", code: 400 } });
      }

      if (user._id.toString() === req.user._id) {
        user.email = email;

        await user.save();

        resp.status(200).json({ message: "Email changed successfully." });
      } else {
        resp
          .status(401)
          .json({ error: { message: "Unauthorized", code: 401 } });
      }
    } catch (error) {
      resp.status(500).json({ message: "Server has error please try later" });
    }
  },
]);

router.put("/changePassword", auth, [
  check("password", "Password must be at least 8 symbols long").isLength({
    min: 8,
  }),

  async (req, resp) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return resp.status(400).json({
          error: {
            message: "PASSWORD_TOO_SHORT",
            code: 400,
          },
        });
      }

      const { email, password } = req.body;

      const user = await User.findOne({ email });

      if (!user) {
        return resp
          .status(400)
          .json({ error: { message: "EMAIL_NOT_FOUND", code: 400 } });
      }

      if (user._id.toString() === req.user._id) {
        const hashedPassword = await bcrypt.hash(password, 12);

        user.password = hashedPassword;

        await user.save();

        resp.status(200).json({ message: "Password changed successfully." });
      } else {
        resp
          .status(401)
          .json({ error: { message: "Unauthorized", code: 401 } });
      }
    } catch (error) {
      resp.status(500).json({ message: "Server has error please try later" });
    }
  },
]);

router.post("/token", async (req, resp) => {
  try {
    const { refresh_token: refreshToken } = req.body;
    const data = tokenService.validateRefresh(refreshToken);
    const dbToken = await tokenService.findToken(refreshToken);

    if (!data || !dbToken || data._id !== dbToken?.user?.toString()) {
      return resp.status(401).json({
        error: {
          message: "Unauthorized",
          code: 401,
        },
      });
    }

    const tokens = await tokenService.generate({ _id: data._id });
    await tokenService.save(data._id, tokens.refreshToken);

    resp.status(200).send({ ...tokens, userId: data._id });
  } catch (error) {
    resp.status(500).json({ message: "Server has error please try later" });
  }
});

module.exports = router;
