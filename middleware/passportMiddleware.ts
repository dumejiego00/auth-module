import { Application } from "express";
import passport from "passport";
import PassportConfig from "./PassportConfig";
import localStrategy from "./passportStrategies/localStrategy";

const passportConfig = new PassportConfig([
  localStrategy,
]);
const passportMiddleware = (app: Application): void => {
  app.use(passport.initialize());
  app.use(passport.session());
};

export default passportMiddleware;
