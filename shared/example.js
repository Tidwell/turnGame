//if included by the client, we declare a new class
function ExampleSharedClass() {
  var privateMethod = function() {
    return true;
  }
  
  return {
    publicMethod: function() {
      return privateMethod();
    },
    publicAttribute: 'string_data'
  };
}

//if the server includes us, we need to return a constructor
if (typeof exports != 'undefined') {
  exports.share = function() { return new ExampleSharedClass; }
 }