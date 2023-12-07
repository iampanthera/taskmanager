import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import User from '../models/user';
import bcrypt from 'bcrypt';

// Local Signup Strategy
passport.use(
  'local-signup',
  new LocalStrategy(
    {
      usernameField: 'username',
      passwordField: 'password',
      passReqToCallback: true,
    },
    async (req, username, password, done) => {
      try {
        const existingUser = await User.findOne({ username });
        console.log({ existingUser})
        if (existingUser) {
          return done(null, false, { message: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashedPassword });
        await user.save();

        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

// Local Login Strategy
passport.use(
  'local-login',
  new LocalStrategy(
    {
      usernameField: 'username',
      passwordField: 'password',
    },
    async (username, password, done) => {
      try {
        const user = await User.findOne({ username });
        if (!user) {
          return done(null, false, { message: 'Invalid username or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: 'Invalid username or password' });
        }

        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

// Serialization and deserialization functions
passport.serializeUser((user: any, done) => done(null, user._id));
passport.deserializeUser((id, done) => User.findById(id, done));
