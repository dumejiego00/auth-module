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
const passport_github2_1 = require("passport-github2");
const databaseAccessLayer_1 = require("../../controllers/databaseAccessLayer");
const githubStrategy = new passport_github2_1.Strategy({
    clientID: process.env.GH_CLIENT_ID || "",
    clientSecret: process.env.GH_CLIENT_SECRET || "",
    callbackURL: process.env.CALLBACK_GITHUB_URL || "",
    passReqToCallback: true,
}, (req, accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const connection = yield (0, databaseAccessLayer_1.getConnection)();
        const user = yield (0, databaseAccessLayer_1.getUserByUsername)(profile.username, connection);
        if (user) {
            return done(null, user);
        }
        else {
            const newUser = yield (0, databaseAccessLayer_1.createUser)(profile.username || `github_user_${profile.id}`, ((_b = (_a = profile.emails) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.value) || "placeholder@github.com", "", connection);
            yield (0, databaseAccessLayer_1.verifyUser)(newUser.id, connection);
            return done(null, Object.assign(Object.assign({}, newUser), { password: "placeholder", is_verified: true, is_admin: false }));
        }
    }
    catch (error) {
        console.error("GitHub Strategy Error:", error);
        return done(error, undefined);
    }
}));
const passportGitHubStrategy = {
    name: "github",
    strategy: githubStrategy,
};
exports.default = passportGitHubStrategy;
