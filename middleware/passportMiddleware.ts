import { Application } from "express";
import passport from "passport";
import PassportConfig from "./PassportConfig";
import localStrategy from "./passportStrategies/localStrategy";
import githubStrategy from "./passportStrategies/githubStrategy"

const passportConfig = new PassportConfig([
  localStrategy,
  githubStrategy
]);
const passportMiddleware = (app: Application): void => {
  app.use(passport.initialize());
  app.use(passport.session());
};

export default passportMiddleware;
