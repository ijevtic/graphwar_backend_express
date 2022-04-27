if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express')
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const http = require('http');
const tools = require('./tools/tools.js')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cors = require('cors');
const User = require('./models/User');
const crypto = require('crypto');
const UserToken = require('./models/UserToken');

mongoose.connect(process.env.DB_CONNECTION, {useNewUrlParser:true,useUnifiedTopology: true });

const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Connected to MongoDB'));

const start_path = process.env.START_PATH_SOCKET;

const app = express()
const server = http.createServer(app);


const someRoute = require('./routes/routes.js')
const register = require('./routes/register.js')

app.use(bodyParser.json());
app.use(cors())
app.use('/lol', someRoute);
app.use('/registers', register);

app.get(start_path+'/', (req, res) => {
    res.sendFile(__dirname + '/views/index_express.html');
});

app.get(start_path+'/styles', (req, res) => {
    console.log("lol")
    res.sendFile(__dirname + '/styles/styles.css');
  });


const initializePassport = require('./passport-config')
initializePassport(passport)


app.set('view-engine', 'ejs')

app.use(express.json())
app.use(express.urlencoded({extended:false})) //from input forms
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.get('/data', checkToken, (req,res) =>{
    res.send({blogs:[
        {title:"Blog1", content:"aa"},
        {title:"Blog2", content:"bb"},
        {title:"Blog3", content:"cc"},
        ]});
})

app.get('/login', checkNotAuthenticated, (req,res) => {
    res.render('login.ejs')
})

app.get('/register', checkNotAuthenticated, (req,res) => {
    res.render('register.ejs')
})

app.post('/login', checkNotAuthenticated, function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        if (err || !user)
            return res.status(500).send({message:'Something went wrong. Try againnnnn'});
        req.logIn(user, function(err) {
            if (err)
                return res.status(500).send({message:'Something went wrong. Try again'});
            
            UserToken.findOne({username: req.body.email}, async (err, user) => {
                if(err)
                    res.send('db error');
                const token = crypto.randomBytes(48).toString('hex');
                const user_token = new UserToken({username: req.body.email,token: token });
                if(user) {
                    const query = { username: req.body.email };
                    const update = { $set: { username: req.body.email, token: token }};
                    const options = {};
                    db.collection("usertokens").updateOne(query, update, options);
                }
                else {
                    try{
                        await user_token.save();
                    } catch (err) {
                        res.status(500).send({message: err});
                    }
                }
                return res.status(200).send({message:'Successfully logged in', token: token});


            })
        });
    })(req, res, next);
});

app.post('/register', checkNotAuthenticated, async (req,res) => {
    User.findOne({username: req.body.email}, async (err, user) => {
        if(err)
            res.send('db error');
        if(user)
            return res.status(400).send({message:'email in use'});
        try {
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            const user_db = new User({
                username: req.body.email,
                password: hashedPassword
            });
            try{
                const savedUser = await user_db.save();
                return res.status(200).send({message:'successfull register'});
            } catch (err) {
                res.status(500).send({message: err});
            }
        } catch {
            res.status(500).send({message:'Something went wrong. Try again'});
        }
    })
})

app.delete('/logout', (req,res) => {
    req.logOut();
    res.status(200);
})

function checkAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    return res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return res.status(401).send({message:'You are already logged in'});
    }
    return next()
}

function checkToken(req, res, next) {
    if(!req.isAuthenticated()) {
        return res.send({message:'You are not logged in'});
    }
    UserToken.findOne({token: req.body.token}, async (err, user) => {
        if(err)
            return res.send('db error');
        if(!user) {
            return res.status(401).send({message:'Bad token'});
        }
        return next();
    })
}

tools.setupSocketIO(server)
tools.runServer(server)