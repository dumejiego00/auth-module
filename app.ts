import path from "path";
import dotenv from "dotenv"
import express from "express";
import flash from "connect-flash";
import session from "express-session";
import expressLayouts from "express-ejs-layouts";
import passportMiddleware from "./middleware/passportMiddleware";

dotenv.config();

const port = process.env.PORT || 8000;

const app = express();

app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, 
      maxAge: 24 * 60 * 60 * 1000, 
    },
  })
);

app.use(flash());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(expressLayouts);

passportMiddleware(app);

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
