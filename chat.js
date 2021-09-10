const uuidv4 = require('uuid').v4;

const messages = new Set();
const users = new Map();

var ChatGroup = require('./models/chatGroup');
var Message = require('./models/message');
var User = require('./models/user');


const defaultUser = {
  id: 'anon',
  name: 'Anonymous',
};

const messageExpirationTimeMS = 5*60 * 1000;

class Connection {
  constructor(io, socket) {
    this.socket = socket;
    this.io = io;

    socket.on('getMessages', (user) => this.getMessages(user));
    socket.on('message', (message) => this.handleMessage(message));
    socket.on('disconnect', () => this.disconnect());
    socket.on('connect_error', (err) => {
      console.log(`connect_error due to ${err.message}`);
    });
  }
  
    sendMessage(message) {
        //console.log('sendMessage');
        //console.log(message);
      this.io.sockets.emit('message', message);
  }
  
    getMessages(user) {
        //console.log('messages1 ', messages);
    //messages.forEach((message) => this.sendMessage(message));
      //console.log('getMessages');
        Message.find({ 'user': user }).then((messages) => {
            messages.forEach(message => {
                message.id = message._id.toHexString();
                this.sendMessage(message);
            });
      });
  }

    handleMessage(message) {
        //console.log(message);
    //const message = {
    //  id: uuidv4(),
    //    user: tempUser,
    //  text: message.value,
   //   time: Date.now()
    //  };

      
      //console.log(this.socket);
      //console.log(users.get(this.socket));
        Message.create({ 'user': message.user, 'text': message.value }).then((message) => {
          message.id = message._id.toHexString();
          //console.log('message Created ', message);
          //console.log(message._id.toHexString());
          this.sendMessage(message);
      });

      //messages.add(message);
      //console.log(message);
    //this.sendMessage(message);

    setTimeout(
      () => {
        messages.delete(message);
        this.io.sockets.emit('deleteMessage', message.id);
      },
      messageExpirationTimeMS,
    );
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