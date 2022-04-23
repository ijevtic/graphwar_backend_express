const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
const User = require('./models/User');

async function initialize(passport) {
    const authenticateUser = async (email, password, done) => {
        User.findOne({username: email}, async (err, user) => {
            console.log(user);
            if(user == null) {
                return done(null, false, {message: "No user with that email"});
            }
            try {
                if(await bcrypt.compare(password, user.password)) {
                    return done(null, user);
                } else {
                    return done(null, false, {message:"Password incorrect"})
                }
            } catch(e) {
                return done(e)
            }
        })
    }
    passport.use(new LocalStrategy({usernameField: 'email'}, authenticateUser))
    passport.serializeUser((user, done) => {done(null,user)})
    passport.deserializeUser((id, done) => {
        return done(null,User.findById(id, function(err, user) {
            if(err)
                return null;
            return user;
        }))
    })
}

module.exports = initialize