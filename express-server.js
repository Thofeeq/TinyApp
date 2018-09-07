"use strict";
const express = require("express");
let app = express();
const PORT = 8080; // default port 8080
const cookieParser = require("cookie-parser")
const bodyParser = require("body-parser");
let errorHTML = {
  emailExistError: false,
  invalidInputError: false,
  invalidCrendential: false,
}

let cookieStatus = 
{
  isLoggedIn : false,
  cookieOwner: "",
  cookieValue: "",
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
    password: "purp"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dish"
  }
}

app.use(cookieParser())
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use('/style', express.static('style'));


function doesValueExist(object,property,value){
  let arrayOfKeys = [];
  arrayOfKeys = Object.keys(object);
  let isTrue = false;
  arrayOfKeys.forEach(function(key){
    // console.log(object[key][property] + "===?" + value);
    
    if(object[key][property] === value ) {
       isTrue = true;
    }
  });
return isTrue;
}

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

function generateRandomString(strLength) {
  
  let outputArray = [];
  let str = "";
  
    for(var i = 0; i < strLength; i++)
    {
      let randomNum = String.fromCharCode(Math.random() * (122 - 65) + 65);
      if(randomNum === '/' || randomNum === '\\') {
        randomNum = 'x';
      };
      outputArray.push(randomNum);
    }
    // console.log(outputArray);
    
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
  res.send("Hello!");
});
app.get("/login", (req, res) => {
  let templateVars = {user: users[req.cookies.user_id], error: errorHTML, status: cookieStatus}
  res.render("login", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/urls", (req, res) => {
  let templateVars = {user: users[req.cookies.user_id], urls: urlDatabase, error: errorHTML, status: cookieStatus };
  res.render("urls_index", templateVars);
  // console.log(templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {user: users[req.cookies.user_id],error: errorHTML, status: cookieStatus}
  if(!req.cookies.user_id)
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
  res.statusCode = 301;
  res.redirect(`${urlDatabase[req.params.shortURL]}`);
});
app.get("/register", (req, res) => {
  let templateVars = {user: users[req.cookies.user_id],shortURL: req.params.id,longURL: urlDatabase[req.params.id],errorCodes: errorHTML, status: cookieStatus };
  res.render("urls_register", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { user: users[req.cookies.user_id],shortURL: req.params.id,longURL: urlDatabase[req.params.id],error: errorHTML, status: cookieStatus };
  res.render("urls_show", templateVars);
});



app.post("/urls", (req, res) => {

  if(req.cookies.user_id)
    {
      let randomShortURL = "";
      randomShortURL = generateRandomString(6);
      urlDatabase[randomShortURL] = {};
      urlDatabase[randomShortURL]["url"]= validateURL(req.body.longURL);
      urlDatabase[randomShortURL]["urlOwner"] = req.cookies.user_id;
      res.redirect(`http://localhost:${PORT}/urls`); 
    }
  console.log(urlDatabase);
      
});

app.post("/urls/:shortURLID/", (req, res) => {

  let shortURLID = req.params.shortURLID;
  urlDatabase[shortURLID]= validateURL(req.body.longURL);
  res.redirect(`http://localhost:${PORT}/urls`);   
  // console.log(urlDatabase);      
});

app.post("/urls/:shortURLID/delete", (req, res) => {
  // console.log(req.params.shortURLID);
  if(req.cookies.user_id)
  {
    delete urlDatabase[req.params.shortURLID];
    res.redirect(`http://localhost:${PORT}/urls`);
  }
  
  
});


app.post("/register", (req, res) => {

if(req.body.email && req.body.password){
  if(!doesValueExist(users,"email",req.body.email)){
    let userID = generateRandomString(6);
    users[userID] = {};
    users[userID].id = userID;
    users[userID].email = req.body.email;
    users[userID].password = req.body.password;
    return res.redirect("/login");
    // console.log(users);
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
  return res.redirect(`http://localhost:${PORT}/register`);
}


 res.cookie('user_id', users.id);
 console.log(users);
 return res.redirect("/urls");
});


app.post("/login", (req, res) => { 

  if(doesValueExist(users, "email", req.body.email)){
    if(getPass(users, req.body.email) === req.body.password){
      // cookieStatus.isLoggedIn = true;
      // cookieStatus.cookieOwner = req.body.email;
      res.cookie('user_id',getID(users, req.body.email));
      // cookieStatus.cookieValue = getID(users, req.body.email);
      // console.log(cookieStatus.cookieValue);
      res.redirect(`http://localhost:${PORT}/urls`)
   
    }
    else{
      errorHTML.invalidCrendential = true;
      res.statusCode = 403;
      return res.redirect(`http://localhost:${PORT}/login`);
    }
  } else {
    errorHTML.invalidCrendential = true
    res.statusCode = 403;
    return res.redirect(`http://localhost:${PORT}/login`);
    
  }

});
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  // cookieStatus.cookieValue = "";
  // cookieStatus.isLoggedIn = false;
  res.redirect(`http://localhost:${PORT}/urls`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
}); 