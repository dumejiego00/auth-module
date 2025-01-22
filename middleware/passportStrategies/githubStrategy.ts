import { Strategy as GitHubStrategy } from "passport-github2";
import { PassportStrategy } from "../../interfaces/index";
import { Request } from "express";
import { VerifyCallback } from "passport-oauth2";
require("dotenv").config();
import { getUserById } from "../../controllers/userController";
import { userModel } from "../../models/userModel";
const githubStrategy: GitHubStrategy = new GitHubStrategy(
  {
    clientID: `${process.env.GH_CLIENT_ID}`,
    clientSecret: `${process.env.GH_CLIENT_SECRET}`,
    callbackURL: "http://localhost:8000/auth/github/callback",
    passReqToCallback: true,
  },
  async (
    req: Request,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback
  ) => {
    try {
      const user = getUserById(profile.id);
      return done(null, user!);
    } catch {
      const newUser = {
        id: Number(profile.id),
        name: profile.username,
        email: "",
        password: "",
      };
      userModel.addUser(newUser);
      return done(null, newUser);
      
    }
  }
);

const passportGitHubStrategy: PassportStrategy = {
  name: "github",
  strategy: githubStrategy,
};
export default passportGitHubStrategy;
