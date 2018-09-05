"use strict";
var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
const bodyParser = require("body-parser");

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString(strLength) {
  
  let outputArray = [];
  let str = "";
    for(var i = 0; i < strLength; i++)
    {
      outputArray.push(String.fromCharCode(Math.random() * (122 - 65) + 65));
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

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
  console.log(templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
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
  let templateVars = { shortURL: req.params.id,longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  let randomShortURL = "";
  randomShortURL = generateRandomString(6);
  
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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
}); 