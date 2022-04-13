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
const tools = require('./tools/run.js')


const start_path = process.env.START_PATH_SOCKET
const users = []

const app = express()
const server = http.createServer(app);


app.get(start_path+'/', (req, res) => {
    res.sendFile(__dirname + '/views/index_express.html');
});

app.get(start_path+'/styles', (req, res) => {
    console.log("lol")
    res.sendFile(__dirname + '/styles/styles.css');
  });


const initializePassport = require('./passport-config')
initializePassport(
    passport,
    email => users.find(user=> user.email === email),
    id => users.find(user => user.id === id)
)


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


app.get('/', checkAuthenticated, (req,res) => {
    res.redirect('http://localhost:3000/game')
    // res.render('index_express.ejs', {name: req.user.name})
})

app.get('/login', checkNotAuthenticated, (req,res) => {
    res.render('login.ejs')
})

app.get('/register', checkNotAuthenticated, (req,res) => {
    res.render('register.ejs')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

app.post('/register', checkNotAuthenticated, async (req,res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        const user = {
            id: Date.now.toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword }
        users.push(user)
        res.redirect('/login')
    } catch {
        res.redirect('/register')
    }
    console.log(users)
})

app.delete('/logout', (req,res) => {
    req.logOut();
    res.redirect('/login')
})

function checkAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    return res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return res.redirect('/');
    }
    return next()
}

tools.setupIO(server)
tools.runServer(server)