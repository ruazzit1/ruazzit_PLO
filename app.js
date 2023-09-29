//basic setup for node.js and express
import dotenv from 'dotenv';
dotenv.config();
import express from "express";
import ejs from "ejs";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import session from "express-session";
import passport from "passport";
import passportLocalMongoose from "passport-local-mongoose";
const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(session ({
    secret: "123456",
    resave: false,
    saveUninitialized: false
}))//start using session
app.use(passport.session());//link passport to session
app.use(passport.initialize());//passport for clients
//end of basic setup
console.log("This is the hidden key: " + process.env.API_KEY); // Lien ket toi .env thanh cong
mongoose.connect('mongodb://127.0.0.1:27017/userDB', { useNewUrlParser: true }); //Connect to MongoDB
const userSchema = mongoose.Schema({username: String, password: String}); //Create new Schema for users table.
userSchema.plugin(passportLocalMongoose);//passport Local Mongoose will encrypt DB via this plugin
const User2 = mongoose.model('user', userSchema); //Create a model attach with userSchema
passport.use(User2.createStrategy());//passport Strategy to create user
passport.serializeUser(User2.serializeUser())//control users cookies
passport.deserializeUser(User2.deserializeUser())//control users cookies

app.get("/", function (req,res) {
res.render("home");
}) //Home page
app.get("/register", function (req,res) {
    res.render("register");
    })
app.get("/login", function (req,res) {
    res.render("login");
    })
app.get("/secrets", function (req,res) {
    if (req.isAuthenticated()){
        res.render("secrets");
        } else {
            res.send("Please login again");   
        }
    })
app.post("/register", function(req,res) {
    const inputEmail = req.body.username;
    const inputPassword = req.body.password;
    User2.register({username: inputEmail},inputPassword, function(err) {
        if (err) {
            res.send(err);
        } else {
            passport.authenticate('local')(req,res, function() {
                res.redirect("/secrets"); //Issue a passport and save into user's browser coookies. Then redirect to secret page   
            })
        }
    });
})
    // User2.findOne({username: inputEmail})
    //     .then((docs)=>{
    //         if (docs) {
    //             res.render("register", {info: 'Email ' + inputEmail + ' has already been regitered'});
    //         } else {
    //             const newUser = new User2({username: inputEmail, password: inputPassword});
    //             newUser
    //             .save()
    //             .then((newRecord) => {
    //               res.send('<form action="/secrets" method="GET"> <button  type="submit" class="btn btn-dark"> $(newRecord) Has been Added Into Our DataBase.</button>  </form>');
    //             })
    //             .catch((err) => {
    //               res.send(err);
    //             }); 
    //         }
    //     })
    //     .catch((err)=>{
    //         console.log(err);
    //     });
    // }) // regist an account to login the secret page
app.post("/login", function(req,res) {
    
    const user = new User2({
    username: req.body.username,
    password: req.body.password,
    })
    req.login(user, function (err) {// using method login from passport library
        if (err) {
            res.send(err);
        } else {
            passport.authenticate('local')(req,res, function() {
                res.redirect("/secrets"); //Issue a passport and save into user's browser coookies. Then redirect to secret page   
            })
        }
    })

})

    // User2.findOne({username: loginEmail, password: loginPassword})
    // .then((docs)=>{
    //     if(docs) {
    //     res.send(docs)}
    //     else {
    //     res.render("login", {wrongEmailOrPass: "Username or password is invalid!"});
    //     }
    // })
    // .catch((err) => {
    //     res.send(err);
    //   }); 
 // verify login password by comparing with password in DB.
 app.get("/logout", function(req,res) {
    req.logout(function (err) {
        if (err) {
            res.send(err)
        } else {  res.redirect("/"); }
    });
   
 })

   



app.listen(3000, () => {
    console.log("Server is started successfully on port 3000.")
});
