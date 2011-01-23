//if included by the client, we declare a new class
function isValidName() {
  return {
    check: function(name) {
      //make sure it only contains A-Z, a-z, 0-9
      var regex=/[A-Za-z0-9]$/;
      //if it didnt pass
      if(!regex.test(name)) return false;
      //otherwise we are good
      return true;
    }
  };
}

//if the server includes us, we need a constructor
if (typeof exports != 'undefined') {
  exports.isValidName = (function() { return new isValidName; })();
}