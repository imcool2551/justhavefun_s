const router = require('express').Router();
const bcrypt = require('bcrypt');

const { forwardAuthenticated, blockAuthenticated } = require('../config/auth');
const User = require('../models/User');
const passport = require('../config/passport');

router.post('/signup', blockAuthenticated, async (req, res, next) => {
  const { email, password, displayName } = req.body;
  try {
    const user = await User.find().or([{ email }, { displayName }]);
    if (user.length > 0) {
      req.flash('error_message', 'User Already Exists');
      return res.redirect('/auth/login_fail');
    }
    bcrypt.genSalt(10, async function (err, salt) {
      const hashedPassword = await bcrypt.hash(password, salt);
      const newUser = new User({
        email,
        password: hashedPassword,
        displayName,
      });
      const savedUser = await newUser.save();
      req.login(savedUser, (err) => {
        if (err) {
          return next(err);
        }
        return res.redirect('/auth/login_success');
      });
    });
  } catch (err) {
    req.flash('error_message', err._message);
    res.redirect('/auth/login_fail');
    next(err);
  }
});

router.post(
  '/login',
  blockAuthenticated,
  passport.authenticate('local', {
    successRedirect: '/auth/login_success',
    failureRedirect: '/auth/login_fail',
    failureFlash: true,
  })
);

router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: 'http://localhost:3000/',
  }),
  function (req, res) {
    res.redirect('http://localhost:3000/');
  }
);

router.get('/login_success', forwardAuthenticated, (req, res) => {
  console.log('LoginSuccess!');
  res.json({
    success: true,
    error_msg: null,
    displayName: req.user.displayName,
  });
});

router.get('/login_fail', blockAuthenticated, (req, res) => {
  res.status(401).json({
    success: false,
    error_msg: req.flash('error_message'),
    displayName: null,
  });
});

router.post('/logout', forwardAuthenticated, (req, res) => {
  console.log('Logging out');
  req.session.destroy((err) => {
    if (err) {
      return next(err);
    }
    res.end('Logged out successful');
  });
});

router.get('/login_check', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      isLoggedin: true,
      displayName: req.user.displayName,
    });
  } else {
    res.json({
      isLoggedin: false,
      displayName: null,
    });
  }
});

module.exports = router;
