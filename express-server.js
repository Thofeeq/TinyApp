"use strict";
var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
var cookieParser = require('cookie-parser')
const bodyParser = require("body-parser");
let username = "";

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};
app.use(cookieParser())
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use('/style', express.static('style'));


function generateRandomString(strLength) {
  
  let outputArray = [];
  let str = "";
  
    for(var i = 0; i < strLength; i++)
    {
      let randomNum = String.fromCharCode(Math.random() * (122 - 65) + 65);
      if(randomNum == 92) {
        random + 1
      };
      outputArray.push(randomNum);
    }
    console.log(outputArray);
    
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

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/urls", (req, res) => {
  let templateVars = {username: req.cookies["username"], urls: urlDatabase };
  res.render("urls_index", templateVars);
  console.log(templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {username: req.cookies["username"]}
  res.render("urls_new", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
app.get("/u/:shortURL", (req, res) => {
  // let longURL = ...
  console.log(`${urlDatabase[req.params.shortURL]}`);
  res.statusCode = 301;
  res.redirect(`${urlDatabase[req.params.shortURL]}`);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { username: req.cookies["username"],shortURL: req.params.id,longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  let randomShortURL = "";
  randomShortURL = generateRandomString(6);
  var cookieParser = require('cookie-parser')
  urlDatabase[randomShortURL]= validateURL(req.body.longURL);
  res.redirect(`http://localhost:${PORT}/urls`);   
  console.log(urlDatabase);      
});

app.post("/urls/:shortURLID/", (req, res) => {

  let shortURLID = req.params.shortURLID;
  urlDatabase[shortURLID]= validateURL(req.body.longURL);
  res.redirect(`http://localhost:${PORT}/urls`);   
  console.log(urlDatabase);      
});

app.post("/urls/:shortURLID/delete", (req, res) => {
  console.log(req.params.shortURLID);
  delete urlDatabase[req.params.shortURLID];
  res.redirect(`http://localhost:${PORT}/urls`);
});

app.post("/login", (req, res) => {
  username = req.body.username;
  res.cookie('username', username);
  res.redirect(`http://localhost:${PORT}/urls`);
});
app.post("/logout", (req, res) => {

  res.clearCookie('username');
  res.redirect(`http://localhost:${PORT}/urls`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
}); 