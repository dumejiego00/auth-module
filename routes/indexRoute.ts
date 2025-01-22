import express from "express";
const router = express.Router();
import {
  ensureAuthenticated,
  forwardAuthenticated,
} from "../middleware/checkAuth";
import { userModel } from "../models/userModel";

router.get("/", (req, res) => {
  res.send("welcome");
});

router.get("/dashboard", ensureAuthenticated, (req, res) => {
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
});

router.get("/admin", ensureAuthenticated, (req, res) => {
  if (req.sessionStore.all == undefined) {
    res.render("adminPanel", {
      user: req.user,
    });
  } else {
    req.sessionStore.all(function (error: any, sessions: any) {
      if (error) {
        res.status(500).send("Error fetching sessions");
      } else {
        const sessionInfo = Object.keys(sessions);
        const sessionArray = [];
        for (const session of sessionInfo) {
          sessionArray.push({
            session_id: session,
            id: sessions[session].passport.user,
          });
        }
        console.log(sessionArray);
        res.render("adminPanel", {
          user: req.user,
          sessions: sessionArray,
        });
      }
    });
  }
});

router.get("/revoke/:sessionid", (req, res) => {
  req.sessionStore.destroy(req.params.sessionid);
  res.redirect("/admin");
});

export default router;
