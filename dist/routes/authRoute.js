"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const passport_1 = __importDefault(require("passport"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const checkAuth_1 = require("../middleware/checkAuth");
const databaseAccessLayer_1 = require("../controllers/databaseAccessLayer");
const transporter = nodemailer_1.default.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
const router = express_1.default.Router();
router.get("/google", passport_1.default.authenticate("google", { scope: ["profile", "email"] }));
// Google authentication callback route
router.get("/google/callback", passport_1.default.authenticate("google", { failureRedirect: "/login" }), (req, res) => {
    var _a;
    const id = req.user.id;
    console.log(req.user);
    if ((_a = req.user) === null || _a === void 0 ? void 0 : _a.is_admin) {
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
router.get("/github", passport_1.default.authenticate("github", { scope: ["user:email"] }), function (req, res) { });
router.get("/github/callback", passport_1.default.authenticate("github", { failureRedirect: "/login" }), (req, res) => {
    var _a;
    const id = req.user.id;
    if ((_a = req.user) === null || _a === void 0 ? void 0 : _a.is_admin) {
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
router.get("/register", checkAuth_1.forwardAuthenticated, (req, res) => {
    const message = req.flash("error");
    res.render("register", { message });
});
router.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const connection = yield (0, databaseAccessLayer_1.getConnection)();
    try {
        const { username, email, password } = req.body;
        const newUser = yield (0, databaseAccessLayer_1.createUser)(username, email, password, connection);
        const JWT_SECRET = process.env.JWT_SECRET;
        if (!JWT_SECRET) {
            throw new Error("JWT_SECRET is not defined in the environment variables");
        }
        const token = jsonwebtoken_1.default.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: "1h" });
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
            yield transporter.sendMail(mailOptions);
            console.log("Verification email sent successfully");
        }
        catch (error) {
            console.error("Failed to send verification email:", error);
            req.flash("error", "Registration successful, but we couldn't send the verification email. Please try again.");
            return res.redirect("/auth/register");
        }
        req.flash("success", "Registration successful. Please check your email to verify your account.");
        res.redirect("/auth/register-success");
    }
    catch (error) {
        if (error instanceof Error) {
            console.error("Registration error:", error.message);
            req.flash("error", error.message);
        }
        else {
            console.error("Unexpected error:", error);
            req.flash("error", "An unexpected error occurred. Please try again.");
        }
        res.redirect("/auth/register");
    }
}));
router.get("/register-success", (req, res) => {
    const message = "Registration successful!";
    res.render("register-success", { message });
});
router.get("/verify-email", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.query.token;
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
        console.error("JWT_SECRET is not defined");
        req.flash("error", "Server configuration error. Please try again later.");
        return res.redirect("/auth/register");
    }
    const connection = yield (0, databaseAccessLayer_1.getConnection)();
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        yield (0, databaseAccessLayer_1.verifyUser)(decoded.userId, connection);
        req.flash("success", "Email verified successfully! You can now log in.");
        res.redirect("/auth/login");
    }
    catch (error) {
        console.error("Email verification error:", error);
        req.flash("error", "Invalid or expired token. Please contact support or try registering again with a different username/email.");
        res.redirect("/auth/register");
    }
}));
router.get("/login", checkAuth_1.forwardAuthenticated, (req, res) => {
    const message = req.flash("error");
    res.render("login", { message });
});
router.post("/login", passport_1.default.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/auth/login",
    failureFlash: true,
}));
router.get("/logout", (req, res) => {
    req.logout((err) => {
        if (err)
            console.log(err);
    });
    res.redirect("/auth/login");
});
exports.default = router;
