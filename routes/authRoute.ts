import express from "express";
import passport from "passport";
import { forwardAuthenticated } from "../middleware/checkAuth";
import { ensureAuthenticated } from "../middleware/checkAuth";
import passportGitHubStrategy from "../middleware/passportStrategies/githubStrategy";
import { userModel } from "../models/userModel";
import jwt from "jsonwebtoken";

import { verifyUser, createUser, getConnection } from "../databaseAccessLayer";
import { get } from "http";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const router = express.Router();

declare module "express-session" {
  interface SessionData {
    messages: string[];
  }
}

passport.use(passportGitHubStrategy.strategy);

router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] }),
  function (req, res) {}
);

router.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  (req, res) => {
    const id = req.user!.id;
    if (userModel.isAdmin(id)) {
      res.render("adminDashboard", {
        user: req.user,
      });
    } else {
      res.render("dashboard", {
        user: req.user,
      });
    }
  }
);

router.get("/register", forwardAuthenticated, (req, res) => {
  const errMessage = req.session.messages;
  let message2 = req.query.message;
  if (message2 === undefined) message2 = "";
  if (errMessage) {
    res.render("register", { message: errMessage, message2:message2 });
  } else {
    res.render("register", { message: "", message2:message2 });
  }
});
router.post("/register", async (req, res) => {
  const connection = await getConnection();
  try {
    const { username, email, password } = req.body;

    const newUser = await createUser(username, email, password, connection);

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in the environment variables");
    }

    const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: "1h" });
    const verificationUrl = `http://localhost:8000/auth/verify-email?token=${token}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Email Verification",
      html: `<p>Please verify your email by clicking the link below:</p><p><a href="${verificationUrl}">Verify Email</a></p>`,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log("Verification email sent successfully");
    } catch (error) {
      console.error("Failed to send verification email:", error);
      return res.status(500).json({ error: "Failed to send verification email. Please try again." });
    }

    res.redirect(`/auth/register-success?message=${encodeURIComponent("Registration successful. Please verify your email.")}`);
  } catch (error:unknown) {
    if (error instanceof Error) {
      res.status(400).redirect(`/auth/register?message=${encodeURIComponent(error.message)}`);
    } else {
      res.status(400).redirect(`/auth/register?message=${encodeURIComponent("An unexpected error occurred.")}`);
    }
  }
});

router.get("/register-success", (req, res) => {
  const message = req.query.message || "Registration successful!";
  res.render("register-success", { message });
});

router.get("/verify-email", async (req, res) => {
  const token = req.query.token as string;
  const connection = await getConnection();

  const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in the environment variables");
}

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };

    await verifyUser(decoded.userId, connection);

    res.redirect(`/auth/login?message=${encodeURIComponent("Email verified successfully. You can now log in.")}`);
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(400).redirect(`/auth/register?message=${encodeURIComponent("Invalid or expired token. Contact yeuphoristic@gmail.com or use different username/email")}`);
  }
});

router.get("/login", forwardAuthenticated, (req, res) => {
  const errMessage = req.session.messages;
  if (errMessage) {
    res.render("login", { message: errMessage });
  } else {
    res.render("login", { message: "" });
  }
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/auth/login",
    failureMessage: true,
  })
);

router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) console.log(err);
  });
  res.redirect("/auth/login");
});

export default router;
