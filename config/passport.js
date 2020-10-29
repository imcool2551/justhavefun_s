const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

const User = require('../models/User');
const { googleClientId, googleClientSecret } = require('./credentials');

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true,
    },
    async (req, email, password, done) => {
      try {
        const user = await User.findOne({ email });
        if (!user) {
          req.flash('error_message', 'User Does not Exist');
          return done(null, false);
        }
        const match = await user.validatePassword(password);
        if (!match) {
          req.flash('error_message', 'Incorrect Password');
          return done(null, false);
        }
        return done(null, user);
      } catch (err) {
        done(err);
      }
    }
  )
);

passport.use(
  new GoogleStrategy(
    {
      clientID: googleClientId,
      clientSecret: googleClientSecret,
      callbackURL: 'http://localhost:5000/auth/google/callback',
    },
    async function (accessToken, refreshToken, profile, done) {
      try {
        let user = await User.findOne({ email: profile.emails[0].value });
        if (user) {
          user.displayName = profile.displayName;
        } else {
          user = new User({
            email: profile.emails[0].value,
            displayName: profile.displayName,
          });
        }
        const newUser = await user.save();
        done(null, newUser);
      } catch (err) {
        done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  console.log('Seriazlie', user);
  done(null, user);
});

passport.deserializeUser((user, done) => {
  console.log('Deseriazlie');
  done(null, user);
});

module.exports = passport;
