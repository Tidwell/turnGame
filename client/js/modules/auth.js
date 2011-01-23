function AuthenticationModule(socket) {
  this.setName = function(name) {
    socket.send({event: 'setName', args: {name: name}});
  }
}