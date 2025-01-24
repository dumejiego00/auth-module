"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const checkAuth_1 = require("../middleware/checkAuth");
const router = express_1.default.Router();
router.get("/", (req, res) => {
    res.send("welcome");
});
router.get("/dashboard", checkAuth_1.ensureAuthenticated, (req, res) => {
    var _a;
    const id = req.user.id;
    if ((_a = req.user) === null || _a === void 0 ? void 0 : _a.is_verified) {
        res.render("adminDashboard", {
            user: req.user,
        });
    }
    else {
        res.render("dashboard", {
            user: req.user,
        });
    }
});
router.get("/admin", checkAuth_1.ensureAuthenticated, (req, res) => {
    if (req.sessionStore.all == undefined) {
        res.render("adminPanel", {
            user: req.user,
        });
    }
    else {
        req.sessionStore.all(function (error, sessions) {
            if (error) {
                res.status(500).send("Error fetching sessions");
            }
            else {
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
exports.default = router;
