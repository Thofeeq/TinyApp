"use strict";
/////////////////////// Required modules and Globals///////////////////
const express = require("express");
let app = express();
const PORT = 8080; // default port 8080
const cookieSession = require("cookie-session")
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
let testPass = "a";
let testPass2 = "b";
let errorHTML = {                       //Keeps track of any input/invalid errors so that it can be displayed on ejs
  emailExistError: false,
  invalidInputError: false,
  invalidCrendential: false,
}




const urlDatabase = {
  "b2xVn2":{
    urlOwner: "user2RandomID",
    url: "http://www.lighthouselabs.ca"},
  "9sm5xK": {
    urlOwner: "user2RandomID",
    url:  "http://www.google.ca"},
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: bcrypt.hashSync(testPass,10)
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: bcrypt.hashSync(testPass2,10),
  }
}

//////////////////////////////////////Setup///////////////////////////////////////////////
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use('/style', express.static('style'));
app.use(cookieSession({
  name: 'session',
  keys: ['development'],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
///////////////////////////////Helper function///////////////////////////////////////////

//Will return a boolean if a given value exist in an object
function doesValueExist(object,property,value){
  let arrayOfKeys = [];
  arrayOfKeys = Object.keys(object);
  let isTrue = false;
  arrayOfKeys.forEach(function(key){   
    if(object[key][property] === value ) {
       isTrue = true;
    }
  });
return isTrue;
}

//will return the id of the user(primary key) given the email (or other property if modified)
function getID(object,emailValue){
  let arrayOfKeys = Object.keys(object);
  let ID = "";
  arrayOfKeys.forEach(function(key){  
    if(object[key].email === emailValue ) {
       ID = key;
    }
  });
return ID;
}
//will return the password of the user
function getPass(object,emailValue){
  let arrayOfKeys = Object.keys(object);
  let password = "";
  arrayOfKeys.forEach(function(key){  
    if(object[key].email === emailValue ) {
       password = object[key].password;
    }
  });
return password;
}
//will generate random string given the length (6 in this case);
function generateRandomString(strLength) {
  
  let outputArray = [];
  let str = "";
  
    for(var i = 0; i < strLength; i++){
      let randomNum = String.fromCharCode(Math.random() * (122 - 65) + 65);
      //omitting slashes in the random generated string so it does not interfere with URI 
      if(randomNum === '/' || randomNum === '\\') {
        randomNum = 'x';
      };
      outputArray.push(randomNum);
    }    
    str = outputArray.join('');
    return str;
}

function validateURL(urlToTest)
{
  const protocolString = "http://";
  let charToCheck = [];
  charToCheck = urlToTest.split('');

  if(charToCheck[3] === 'p' && charToCheck[4] === ':'){
    return urlToTest;
  }else {
      return protocolString + urlToTest;
  }

}

app.get("/", (req, res) => {
  res.redirect("/urls");
});
app.get("/login", (req, res) => {
  if(!req.session.user_id)
  {
    let templateVars = {user: users[req.session.user_id], error: errorHTML}
    res.render("login", templateVars);
  }
  else{
    res.redirect("/urls");
  }

});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/urls", (req, res) => {

  
  if(!req.session.user_id){
    res.redirect("/login");
  }
  else
  {
    console.log(Object.keys(users).indexOf(req.session.user_id));
    if(Object.keys(users).indexOf(req.session.user_id) === -1)
    {
      req.session = null;
      return res.redirect('/login');
    }
    else
    {
      console.log("here!");
      let templateVars = {user: users[req.session.user_id], urls: urlDatabase, error: errorHTML};
      res.render("urls_index", templateVars);
    }

  }
  // console.log(templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {user: users[req.session.user_id],error: errorHTML}
  if(!req.session.user_id)
  {
    return res.redirect("/login");
  }
  res.render("urls_new", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
app.get("/u/:shortURL", (req, res) => {
  // let longURL = ...
  // console.log(`${urlDatabase[req.params.shortURL]}`);
  if(urlDatabase[req.params.shortURL])
  {
    res.statusCode = 301;
    res.redirect(`${urlDatabase[req.params.shortURL].url}`);
  }
  else{
    res.statusCode = 404;
    res.send("<h1>Errpr 404: Page not found!");
  }

});
app.get("/register", (req, res) => {
  let templateVars = {user: users[req.session.user_id],shortURL: req.params.id,longURL: urlDatabase[req.params.id],errorCodes: errorHTML };
  res.render("urls_register", templateVars);
});

app.get("/urls/:id", (req, res) => {
 if(!urlDatabase[req.params.id])
 {
   res.send("<h1>Error: 404 - URL Not found! click <a href='/urls'>here</a> to return<h1>");
 } 
 else
 {
  if(req.session.user_id && req.session.user_id=== urlDatabase[req.params.id].urlOwner)
  {
    let templateVars = { user: users[req.session.user_id],shortURL: req.params.id,longURL: urlDatabase[req.params.id],error: errorHTML, urls:urlDatabase };
    res.render("urls_show", templateVars);
  }
  else if(req.session.user_id)
  {
    return res.send("<html><body><p1>ACCESS DENIED</p1></body></html>");
  }
  else{
    return res.redirect("/login");
  }

 }

});



app.post("/urls", (req, res) => {

  if(req.session.user_id)
    {
      let randomShortURL = "";
      randomShortURL = generateRandomString(6);
      urlDatabase[randomShortURL] = {};
      urlDatabase[randomShortURL]["url"]= validateURL(req.body.longURL);
      urlDatabase[randomShortURL]["urlOwner"] = req.session.user_id;
      res.redirect(`http://localhost:${PORT}/urls`); 
    }
  console.log(urlDatabase);
      
});

app.post("/urls/:shortURLID/", (req, res) => {
  if(req.session.user_id)
  {
    let shortURLID = req.params.shortURLID;
    urlDatabase[shortURLID].url= validateURL(req.body.longURL);
    res.redirect(`http://localhost:${PORT}/urls`);
  }
  else{
    return res.redirect("/login");
  }
   
  // console.log(urlDatabase);      
});

app.post("/urls/:shortURLID/delete", (req, res) => {
  // console.log(req.params.shortURLID);
  if(req.session.user_id)
  {
    delete urlDatabase[req.params.shortURLID];
    res.redirect(`/urls`);
  }
  
  
});


app.post("/register", (req, res) => {

if(req.body.email && req.body.password){
  if(!doesValueExist(users,"email",req.body.email)){
    let userID = generateRandomString(6);
    users[userID] = {};
    users[userID].id = userID;
    users[userID].email = req.body.email;
    users[userID].password = bcrypt.hashSync(req.body.password, 10);
    req.session.user_id = getID(users, req.body.email);
    return res.redirect("/urls");

    console.log(users);
  } else {
   
    // console.log("User email in db!");
    errorHTML.emailExistError = true;
    res.statusCode = 400;
    return res.redirect(`/register`);
  }

}

else{
  
  console.log("Invalid input");
  errorHTML.invalidInputError = true;
  // console.log(errorHTML.showError1);
  // console.log(errorHTML.showError2);
  res.statusCode = 400;
  return res.redirect(`/register`);
}


 res.cookie('user_id', users.id);
 console.log(users);
 return res.redirect("/urls");
});


app.post("/login", (req, res) => { 

  if(doesValueExist(users, "email", req.body.email)){
    if( bcrypt.compareSync(req.body.password, users[getID(users,req.body.email)].password) ){
      // cookieStatus.isLoggedIn = true;
      // cookieStatus.cookieOwner = req.body.email;
      req.session.user_id = getID(users, req.body.email);
      // cookieStatus.cookieValue = getID(users, req.body.email);
      // console.log(cookieStatus.cookieValue);
      res.redirect("/urls")
      console.log(users);
    }
    else{
      errorHTML.invalidCrendential = true;
      res.statusCode = 403;
      return res.redirect("/login");
    }
  } else {
    errorHTML.invalidCrendential = true
    res.statusCode = 403;
    return res.redirect("/login");
    
  }

});
app.post("/logout", (req, res) => {
  req.session = null;
  // cookieStatus.cookieValue = "";
  // cookieStatus.isLoggedIn = false;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
}); 