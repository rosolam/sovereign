//* Utility function to parse user id from a soul
export function parseUserFromSoul(soul){

    if(!soul){return}
    var patt = /^~[^/]*/;
    var result = soul.match(patt);
    if(result.length == 0){return}
    return result[0]
  }
  
  //* Utility function to parse content id from a soul
  export function parseIDFromSoul(soul){
  
    if(!soul){return}
    var patt = /[^/]*$/;
    var result = soul.match(patt);
    if(result.length == 0){return}
    return result[0]
  
  }