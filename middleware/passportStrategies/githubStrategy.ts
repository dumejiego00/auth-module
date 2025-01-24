import { Request } from "express";
import { VerifyCallback } from "passport-oauth2";
import { PassportStrategy } from "../../interfaces/index";
import { Strategy as GitHubStrategy } from "passport-github2";
import { createUser, verifyUser, getConnection, getUserByUsername } from "../../controllers/databaseAccessLayer";

const githubStrategy: GitHubStrategy = new GitHubStrategy(
  {
    clientID: process.env.GH_CLIENT_ID || "",
    clientSecret: process.env.GH_CLIENT_SECRET || "",
    callbackURL: process.env.CALLBACK_GITHUB_URL || "",
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
      const connection = await getConnection();
      const user = await getUserByUsername(profile.username, connection); 

      if (user) {
        return done(null, user);
      } else {
        const newUser = await createUser(
          profile.username || `github_user_${profile.id}`,
          profile.emails?.[0]?.value || "placeholder@github.com",
          "", 
          connection
        );
        await verifyUser(newUser.id, connection)
        return done(null, {...newUser, password:"placeholder", is_verified:true, is_admin:false});
      }
    } catch (error) {
      console.error("GitHub Strategy Error:", error);
      return done(error as Error, undefined);
    }
  }
);

const passportGitHubStrategy: PassportStrategy = {
  name: "github",
  strategy: githubStrategy,
};

export default passportGitHubStrategy;
