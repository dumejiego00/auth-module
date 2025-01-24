"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const connect_flash_1 = __importDefault(require("connect-flash"));
const express_session_1 = __importDefault(require("express-session"));
const express_ejs_layouts_1 = __importDefault(require("express-ejs-layouts"));
const passportMiddleware_1 = __importDefault(require("./middleware/passportMiddleware"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.set("view engine", "ejs");
app.use(express_1.default.static(path_1.default.join(__dirname, "public")));
app.use((0, express_session_1.default)({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false,
        maxAge: 24 * 60 * 60 * 1000,
    },
}));
app.use((0, connect_flash_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_ejs_layouts_1.default);
(0, passportMiddleware_1.default)(app);
app.use((req, res, next) => {
    console.log(`User details are:`, req.user);
    console.log("Entire session object:");
    console.log(req.session);
    console.log(`Session details are:`);
    console.log(req.session.passport);
    next();
});
// Import routes
const authRoute_1 = __importDefault(require("./routes/authRoute"));
const indexRoute_1 = __importDefault(require("./routes/indexRoute"));
// Use routes
app.use("/", indexRoute_1.default);
app.use("/auth", authRoute_1.default);
if (process.env.NODE_ENV !== "production") {
    const port = process.env.PORT || 8000;
    app.listen(port, () => {
        console.log(`🚀 Server has started on http://localhost:${port}`);
    });
}
exports.default = app;
