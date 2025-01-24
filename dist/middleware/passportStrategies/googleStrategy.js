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
Object.defineProperty(exports, "__esModule", { value: true });
const passport_google_oauth20_1 = require("passport-google-oauth20");
const databaseAccessLayer_1 = require("../../controllers/databaseAccessLayer");
const databaseAccessLayer_2 = require("../../controllers/databaseAccessLayer");
const googleStrategy = new passport_google_oauth20_1.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    callbackURL: process.env.CALLBACK_GOOGLE_URL || "",
    passReqToCallback: true,
}, (req, accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const connection = yield (0, databaseAccessLayer_1.getConnection)();
        const user = yield (0, databaseAccessLayer_2.getUserByEmail)(((_b = (_a = profile.emails) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.value) || "", connection);
        if (user) {
            return done(null, user);
        }
        else {
            const newUser = yield (0, databaseAccessLayer_2.createUser)(profile.displayName || `google_user_${profile.id}`, ((_d = (_c = profile.emails) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.value) || "placeholder@gmail.com", "", connection);
            yield (0, databaseAccessLayer_2.verifyUser)(newUser.id, connection);
            return done(null, Object.assign(Object.assign({}, newUser), { password: "placeholder", is_verified: true, is_admin: false }));
        }
    }
    catch (error) {
        console.error("Google Strategy Error:", error);
        return done(error, undefined);
    }
}));
const passportGoogleStrategy = {
    name: "google",
    strategy: googleStrategy,
};
exports.default = passportGoogleStrategy;
