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
global.username="";
global.budget_val=0;
global.flag=0;
mongoose.connect("mongodb+srv://pj-admin:test123@cluster0.tclkd.mongodb.net/userDB", {useNewUrlParser: true});
const userSchema = new mongoose.Schema ({
  email: String,
  password: String,
  budget: Number
});

const expenseSchema = new mongoose.Schema ({
  email: String,
  category: String,
  cost: Number,
  item: String,
  date:
  {
    type:Date, 
    default:Date.now()
  },
  delete:Boolean
});
const secret = "Thisisourlittlesecret.";
userSchema.plugin(encrypt, { secret: secret, encryptedFields: ["password"] });


const User = new mongoose.model("User", userSchema);
const Expense = new mongoose.model("Expense",expenseSchema);
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
  if(flag==1){res.sendFile(__dirname+'/home.html');}
  else{res.redirect('/')}
});
app.get("/settings", function(req, res){
  if(flag==1){res.sendFile(__dirname+'/settings.html');}
  else{res.redirect('/')}
});
app.get("/dashboard", function(req, res){
  if(flag==1)
  {   
    Expense.find({ email: username }, function(err, results) {
        if (err) {
          console.log(err);
        } else {
          console.log(results);
          res.render('dashboard',{budget:budget_val,results:results});
        }
      });
  }
  else{res.redirect('/')}
});
app.get("/signout", function(req, res){
  if(flag==1)
  {
    flag=0;
    console.log(flag);
    res.redirect('/');
    
  }
  else{res.redirect('/')}
});
app.post("/register", function(req, res){
  username = req.body.username;
  const newUser =  new User({
    email: req.body.username,
    password: req.body.password
  });
  newUser.save(function(err){
    if (err) {
      console.log(err);
    } else {
      flag=1;
      budget_val=0;
      res.sendFile(__dirname+'/home.html');
    }
  });

});
app.post("/login", function(req, res){
  username = req.body.username;
  const password = req.body.password;
  console.log(username);
  console.log(password);
  User.findOne({email: username}, function(err, foundUser){
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        if (foundUser.password === password) {
          budget_val = foundUser.budget
          flag=1;
          res.sendFile(__dirname+'/home.html');
        }
      }
    }
  });
});
app.post("/budget",function(req,res){
  var budget= Number(req.body.budget);
  budget_val = budget;
  console.log(budget)
  User.updateOne({email:username},{budget:budget},function(err){
    if(err){
         console.log(err);
       }
    else{
         console.log('All good!')
       }
     })
  res.sendFile(__dirname+'/settings.html');
})
app.post("/expenditure",function(req,res){
  var category = req.body.cat;
  var item = req.body.item;
  var cost = Number(req.body.cost);
  console.log(category);
  console.log(item);
  console.log(cost);
  const newExpense =  new Expense({
    email: username,
    category: category,
    item: item,
    cost: cost,
    delete:0
  });
  newExpense.save(function(err){
    if (err) {
      console.log(err);
    } else {
      budget_val = budget_val-cost;
      User.updateOne({email:username},{budget:budget_val},function(err){
        if(err){
             console.log(err);
           }
        else{
             console.log('All good!')
           }
         })
      res.sendFile(__dirname+'/settings.html');
    }
  });
  
})
app.post("/checkbox",function(req,res){
  var id = req.body.checkbox;
  Expense.findOne({_id: id}, function(err, foundUser){
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        if (foundUser.delete === false) {
          budget_val = Number(budget_val)+Number(foundUser.cost);
          Expense.updateOne({_id:id},{delete:1},function(err){
            if(err){
                 console.log(err);
               }
            else{
                 console.log('All good!')
               }
             });
             User.updateOne({email:username},{budget:budget_val},function(err){
              if(err){
                   console.log(err);
                 }
              else{
                   console.log('All good!')
                 }
               });
               res.redirect('/dashboard');
        }
        else{
          budget_val = Number(budget_val)-Number(foundUser.cost);
          Expense.updateOne({_id:id},{delete:false},function(err){
            if(err){
                 console.log(err);
               }
            else{
                 console.log('All good!')
               }
             });
          
          User.updateOne({email:username},{budget:budget_val},function(err){
            if(err){
                 console.log(err);
               }
            else{
                 console.log('All good!')
               }
             });
             res.redirect('/dashboard');
        }
      }
    }
  });
})
app.listen(3000, function() {
  console.log("Server started on port 3000.");
});