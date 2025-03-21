import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { User as AppUser, PassportStrategy } from "../../interfaces/index";
import { getConnection, getUserByEmail, getUserById } from "../../controllers/databaseAccessLayer";

declare global {
  namespace Express {
    interface User extends AppUser {} 
  }
}

const localStrategy = new LocalStrategy(
  {
    usernameField: "email", 
    passwordField: "password", 
  },
  async (email, password, done) => {
    let connection;
    try {
      connection = await getConnection();

      const user = await getUserByEmail(email, connection);

      if (!user) {
        return done(null, false, { message: "No user found with that email" });
      }

      if (!user.is_verified) {
        return done(null, false, { message: "Email not verified" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return done(null, false, { message: "Incorrect password" });
      }

      return done(null, user);
    } catch (error: any) {
      return done(error, false, { message: error.message });
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }
);

passport.serializeUser(function (
  user: Express.User,
  done: (err: any, id?: number) => void
) {
  done(null, user.id);
});

passport.deserializeUser(async function (
  id: number,
  done: (err: any, user?: Express.User | false | null) => void
) {
  let connection;
  try {
    connection = await getConnection();

    const user = await getUserById(Number(id), connection);

    if (user) {
      done(null, user);
    } else {
      done({ message: "User not found" }, null);
    }
  } catch (error) {
    done({ message: "Error fetching user", error }, null);
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

const passportLocalStrategy: PassportStrategy = {
  name: "local",
  strategy: localStrategy,
};

export default passportLocalStrategy;
