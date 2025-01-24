import express from "express";
import expressLayouts from "express-ejs-layouts";
import session from "express-session";
import path from "path";
import passportMiddleware from "./middleware/passportMiddleware";
import flash from "connect-flash";

const port = process.env.PORT || 8000; // Fixed typo: `process.env.port` -> `process.env.PORT`

const app = express();

// Set view engine
app.set("view engine", "ejs");

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Initialize session middleware
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set `true` in production with HTTPS
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  })
);

// Initialize connect-flash
app.use(flash());

// Middleware for parsing request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up EJS layouts
app.use(expressLayouts);

// Initialize passport middleware
passportMiddleware(app);

// Custom middleware for flash messages and logging
app.use((req, res, next) => {
  console.log(`User details are:`, req.user);

  console.log("Entire session object:");
  console.log(req.session);

  console.log(`Session details are:`);
  console.log((req.session as any).passport);
  next();
});

// Import routes
import authRoute from "./routes/authRoute";
import indexRoute from "./routes/indexRoute";

// Use routes
app.use("/", indexRoute);
app.use("/auth", authRoute);

// Start server
app.listen(port, () => {
  console.log(`🚀 Server has started on http://localhost:${port}`);
});
