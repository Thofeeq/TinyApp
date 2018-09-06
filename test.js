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

let users = { 
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

console.log(getID(users,"user2@example.com"));