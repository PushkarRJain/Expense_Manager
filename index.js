const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
const JSAlert = require('js-alert');
const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

mongoose.connect("mongodb+srv://pj-admin:test123@cluster0.tclkd.mongodb.net/userDB", {useNewUrlParser: true});
const userSchema = new mongoose.Schema ({
  email: String,
  password: String
});

const secret = "Thisisourlittlesecret.";
userSchema.plugin(encrypt, { secret: secret, encryptedFields: ["password"] });


const User = new mongoose.model("User", userSchema);

app.get("/", function(req, res){
  res.sendFile(__dirname+'/index.html');
});
app.get("/login", function(req, res){
  res.sendFile(__dirname+'/login.html');
});
app.get("/register", function(req, res){
  res.sendFile(__dirname+'/register.html');
});
app.get("/home", function(req, res){
  res.sendFile(__dirname+'/home.html');
});
app.get("/settings", function(req, res){
  res.sendFile(__dirname+'/settings.html');
});
app.get("/dashboard", function(req, res){
  res.sendFile(__dirname+'/dashboard.html');
});
app.post("/register", function(req, res){
  const newUser =  new User({
    email: req.body.username,
    password: req.body.password
  });
  newUser.save(function(err){
    if (err) {
      console.log(err);
    } else {
      res.sendFile(__dirname+'/home.html');
    }
  });

});
app.post("/login", function(req, res){
  const username = req.body.username;
  const password = req.body.password;
  console.log(username);
  console.log(password);
  User.findOne({email: username}, function(err, foundUser){
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        if (foundUser.password === password) {
          res.sendFile(__dirname+'/home.html');
        }
      }
    }
  });
});
app.post("/budget",function(req,res){
  var budget= Number(req.body.budget);
  console.log(budget)
  res.sendFile(__dirname+'/settings.html');
})
app.post("/expenditure",function(req,res){
  var category = req.body.cat;
  var item = req.body.item;
  var cost = Number(req.body.cost);
  console.log(category);
  console.log(item);
  console.log(cost);
  res.sendFile(__dirname+'/settings.html');
})
app.listen(3000, function() {
  console.log("Server started on port 3000.");
});