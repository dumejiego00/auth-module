import passport from "passport";
import { PassportStrategy } from "../interfaces";
import dotenv from "dotenv"
dotenv.config()

export default class PassportConfig {
 
  constructor(strategies: PassportStrategy[]) {
    this.addStrategies(strategies);
  }

  private addStrategies(strategies: PassportStrategy[]): void {
    strategies.forEach((passportStrategy: PassportStrategy) => {
      passport.use(passportStrategy.name, passportStrategy.strategy);
    });
  }
}
