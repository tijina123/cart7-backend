// backend/passport.js
const passport = require("passport");
require('dotenv').config()
const GoogleStrategy = require("passport-google-oauth20").Strategy;

console.log(process.env.GOOGLE_CLIENT_ID,"===process.env.GOOGLE_CLIENT_ID");
console.log(process.env.GOOGLE_CLIENT_SECRET,"===process.env.GOOGLE_CLIENT_SECRET");



passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      // Here you can save or find the user in your database
      // Example: User.findOrCreate({ googleId: profile.id }, done);
      return done(null, profile); // Replace with your logic
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
});



// // backend/passport.js
// const passport = require("passport");
// const GoogleStrategy = require("passport-google-oauth20").Strategy;

// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: "/api/auth/google/callback",
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       // Here you can save or find the user in your database
//       // Example: User.findOrCreate({ googleId: profile.id }, done);
//       return done(null, profile); // Replace with your logic
//     }
//   )
// );

// passport.serializeUser((user, done) => {
//   done(null, user);
// });
// passport.deserializeUser((user, done) => {
//   done(null, user);
// });
