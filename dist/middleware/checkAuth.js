"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forwardAuthenticated = exports.ensureAuthenticated = void 0;
const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/auth/login");
};
exports.ensureAuthenticated = ensureAuthenticated;
const forwardAuthenticated = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return next();
    }
    res.redirect("/dashboard");
};
exports.forwardAuthenticated = forwardAuthenticated;
