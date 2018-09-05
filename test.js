function generateRandomString(strLength) {
  
  let outputArray = [];
  let str = "";
    for(i = 0; i < strLength; i++)
    {
      outputArray.push(String.fromCharCode(Math.random() * (122 - 65) + 65));
    }
    console.log(outputArray);
    
    str = outputArray.join('');
    return str;
}

console.log(generateRandomString(6));