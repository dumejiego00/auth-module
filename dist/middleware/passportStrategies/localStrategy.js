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
const bcrypt_1 = __importDefault(require("bcrypt"));
const passport_1 = __importDefault(require("passport"));
const passport_local_1 = require("passport-local");
const databaseAccessLayer_1 = require("../../controllers/databaseAccessLayer");
const localStrategy = new passport_local_1.Strategy({
    usernameField: "email",
    passwordField: "password",
}, (email, password, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const connection = yield (0, databaseAccessLayer_1.getConnection)();
        const user = yield (0, databaseAccessLayer_1.getUserByEmail)(email, connection);
        if (!user) {
            return done(null, false, { message: "No user found with that email" });
        }
        if (!user.is_verified) {
            return done(null, false, { message: "Email not verified" });
        }
        const isValidPassword = yield bcrypt_1.default.compare(password, user.password);
        if (!isValidPassword) {
            return done(null, false, { message: "Incorrect password" });
        }
        return done(null, user);
    }
    catch (error) {
        return done(error, false, { message: error.message });
    }
}));
passport_1.default.serializeUser(function (user, done) {
    done(null, user.id);
});
passport_1.default.deserializeUser(function (id, done) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const connection = yield (0, databaseAccessLayer_1.getConnection)();
            const user = yield (0, databaseAccessLayer_1.getUserById)(Number(id), connection);
            if (user) {
                done(null, user);
            }
            else {
                done({ message: "User not found" }, null);
            }
        }
        catch (error) {
            done({ message: "Error fetching user", error }, null);
        }
    });
});
const passportLocalStrategy = {
    name: "local",
    strategy: localStrategy,
};
exports.default = passportLocalStrategy;
