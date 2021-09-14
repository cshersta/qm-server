
const users = new Map();

var ChatGroup = require('./models/chatGroup');
var Message = require('./models/message');
var User = require('./models/user');


class Connection {
  constructor(io, socket) {
    this.socket = socket;
    this.io = io;

    socket.on('getMessages', (user) => this.getMessages(user));
    socket.on('message', (message) => this.handleMessage(message));
    socket.on('signUp', (user) => this.signUp(user));
    socket.on('disconnect', () => this.disconnect());
    socket.on('connect_error', (err) => {
      console.log(`connect_error due to ${err.message}`);
    });
  }
  
    sendMessage(message) {
      this.io.sockets.emit('message', message);
  }
  
    getMessages(user) {
        Message.find({ 'user': user }).then((messages) => {
            messages.forEach(message => {
                message.id = message._id.toHexString();
                this.sendMessage(message);
            });
      });
  }

    handleMessage(message) {
        
        Message.create({ 'user': message.user, 'text': message.value }).then((message) => {
          message.id = message._id.toHexString();
          this.sendMessage(message);
      });
    }

    signUp(user) {

        User.create({ username: user.userName, password : user.password}).then((newUser) => {
            console.log(newUser);
        });
    }

  disconnect() {
    users.delete(this.socket);
  }
}

function chat(io) {
  io.on('connection', (socket) => {
    new Connection(io, socket);   
  });
};

module.exports = chat;