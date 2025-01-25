import { Request } from "express";
import { VerifyCallback } from "passport-oauth2";
import { PassportStrategy } from "../../interfaces/index";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { getConnection } from "../../controllers/databaseAccessLayer";
import { createUser, verifyUser, getUserByEmail } from "../../controllers/databaseAccessLayer";

const googleStrategy: GoogleStrategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    callbackURL: process.env.CALLBACK_GOOGLE_URL || "",
    passReqToCallback: true,
  },
  async (
    req: Request,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback
  ) => {
    let connection;
    try {
      connection = await getConnection();

      const user = await getUserByEmail(profile.emails?.[0]?.value || "", connection);

      if (user) {
        return done(null, user);
      } else {
        const newUser = await createUser(
          profile.displayName || `google_user_${profile.id}`,
          profile.emails?.[0]?.value || "placeholder@gmail.com",
          "",
          connection
        );
        await verifyUser(newUser.id, connection);
        return done(null, {
          ...newUser,
          password: "placeholder",
          is_verified: true,
          is_admin: false,
        });
      }
    } catch (error) {
      return done(error as Error, undefined);
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }
);

const passportGoogleStrategy: PassportStrategy = {
  name: "google",
  strategy: googleStrategy,
};

export default passportGoogleStrategy;
