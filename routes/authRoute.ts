import express from "express";
import passport from "passport";
import { forwardAuthenticated } from "../middleware/checkAuth";
import passportGitHubStrategy from "../middleware/passportStrategies/githubStrategy";
import { userModel } from "../models/userModel";
import jwt from "jsonwebtoken";
import { verifyUser, createUser, getConnection } from "../controllers/databaseAccessLayer";
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
  const message = req.flash("error"); 
  res.render("register", { message});
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
      html: `
        <p>Welcome, <strong>${username}</strong>!</p>
        <p>Thank you for registering. Please verify your email by clicking the link below:</p>
        <p><a href="${verificationUrl}">Verify Email</a></p>
        <p>If you did not sign up, please ignore this email.</p>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log("Verification email sent successfully");
    } catch (error) {
      console.error("Failed to send verification email:", error);
      req.flash(
        "error",
        "Registration successful, but we couldn't send the verification email. Please try again."
      );
      return res.redirect("/auth/register");
    }

    req.flash(
      "success",
      "Registration successful. Please check your email to verify your account."
    );
    res.redirect("/auth/register-success");
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Registration error:", error.message);
      req.flash("error", error.message);
    } else {
      console.error("Unexpected error:", error);
      req.flash("error", "An unexpected error occurred. Please try again.");
    }
    res.redirect("/auth/register");
  }
});


router.get("/register-success", (req, res) => {
  const message = "Registration successful!";
  res.render("register-success", { message });
});

router.get("/verify-email", async (req, res) => {
  const token = req.query.token as string;

  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    console.error("JWT_SECRET is not defined");
    req.flash("error", "Server configuration error. Please try again later.");
    return res.redirect("/auth/register");
  }

  const connection = await getConnection();

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };

    await verifyUser(decoded.userId, connection);

    req.flash("success", "Email verified successfully! You can now log in.");
    res.redirect("/auth/login");
  } catch (error) {
    console.error("Email verification error:", error);
    req.flash(
      "error",
      "Invalid or expired token. Please contact support or try registering again with a different username/email."
    );
    res.redirect("/auth/register");
  }
});


router.get("/login", forwardAuthenticated, (req, res) => {
  const message = req.flash("error"); 
  res.render("login", { message });
});


router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/auth/login",
    failureFlash: true,
  })
);

router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) console.log(err);
  });
  res.redirect("/auth/login");
});

export default router;
