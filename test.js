function generateRandomString(strLength) {
  
  let outputArray = [];
  let str = "";
  console.log("heres the slash" + '\\');
  
    for(var i = 0; i < strLength; i++)
    {
      let randomNum = String.fromCharCode(Math.random() * (122 - 65) + 65);
      if(randomNum === '\\' || randomNum === '/') {
        randomNum = 'a';
      };
      outputArray.push(randomNum);
    }
    console.log(outputArray);
    
    str = outputArray.join('');
    return str;
}

generateRandomString(6)
















// function validateURL(urlToTest)
// {
//   const protocolString = "http://";
//   let charToCheck = [];
//   charToCheck = urlToTest.split('');

//   if(charToCheck[3] === 'p' && charToCheck[4] === ':'){
//     return urlToTest;
//   }else {
//       return protocolString + urlToTest;
//   }

// }