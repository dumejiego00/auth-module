import express from "express";
import passport from "passport";
import { forwardAuthenticated } from "../middleware/checkAuth";
import { ensureAuthenticated } from "../middleware/checkAuth";
import passportGitHubStrategy from "../middleware/passportStrategies/githubStrategy";
import { userModel } from "../models/userModel";

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
