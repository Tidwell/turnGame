//The list of modules you want to load on the server & client
var list = [
    'auth',
    'matchmaker',
    'gameaction'
]



/*
Below is just the standard shared class pattern to expose the list
to both the client and server
*/
//if the client includes us, we need to reutn the list
function modulesToLoad() {
  return list;
}
//if the server includes us, we also need to return the list
if (typeof exports != 'undefined') {
  module.exports = list;
}