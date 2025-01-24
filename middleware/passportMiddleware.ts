import passport from "passport";
import { Application } from "express";
import PassportConfig from "./PassportConfig";
import localStrategy from "./passportStrategies/localStrategy";
import githubStrategy from "./passportStrategies/githubStrategy"
import googleStragegy from "./passportStrategies/googleStrategy"


const passportConfig = new PassportConfig([
  localStrategy,
  githubStrategy,
  googleStragegy
]);
const passportMiddleware = (app: Application): void => {
  app.use(passport.initialize());
  app.use(passport.session());
};

export default passportMiddleware;
