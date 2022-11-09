import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import passport from "passport";
import { User } from "../models/userSchema.js";

export const connectPassport = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async function (accessToken, refreshToken, profile, next) {
        //finding user
        const user = await User.findOne({
          googleId: profile.id,
        });

        if (!user) {
          //if user is new then create user
          const newUser = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            photo: profile.photos[0].value,
          });

          return next(null, newUser);
        } else {
          //if user already exists then just call next
          return next(null, user);
        }
      }
    )
  );

  passport.serializeUser((user, next) => {
    next(null, user.id);
  });

  passport.deserializeUser(async (id, next) => {
    const user = await User.findById(id);
    next(null, user);
  });
};
