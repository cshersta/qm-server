
const users = new Map();

var ChatGroup = require('./models/chatGroup');
var Message = require('./models/message');
var User = require('./models/user');
var _ = require('lodash');


class Connection {
  constructor(io, socket) {
    this.socket = socket;
    this.io = io;

      socket.on('getMessages', (user, chatGroup) => this.getMessages(user, chatGroup));
    socket.on('message', (message) => this.handleMessage(message));
    socket.on('signUp', (user) => this.signUp(user));
    socket.on('disconnect', () => this.disconnect());
    socket.on("getUser", (user, fn) => this.getUser(user, fn));
      socket.on("getChatGroup", (userArray, fn) => this.getChatGroup(userArray, fn));
      socket.on("getGroupsByUser", (username) => this.getGroupsByUser(username));
    socket.on("getSelfChatGroup", (username, fn) => this.getSelfChatGroup(username, fn));
    socket.on('connect_error', (err) => {
      console.log(`connect_error due to ${err.message}`);
    });
  }
  
    sendMessage(message) {
      this.io.sockets.emit('message', message);
    }

    sendGroups(groups) {
        this.io.sockets.emit('groups', groups);
    }
  
    getMessages(user, chatGroup) {
        console.log("get messages chatgroup");
        console.log(chatGroup);
        Message.find({ 'group': chatGroup[0]._id }).then((messages) => {
            messages.forEach(message => {
                message.id = message._id.toHexString();
                this.sendMessage(message);
            });
      });
  }

    handleMessage(message) {
        Message.create({ group: message.chatGroup[0]._id, 'user': message.user, 'text': message.value }).then((newMessage) => {
            console.log("message" + newMessage);
            newMessage.id = newMessage._id.toHexString();

            ChatGroup.findOneAndUpdate({ _id: message.chatGroup[0]._id }, { $set: { lastMessage: newMessage } })
                .populate('lastMessage')
                .then((group) => {
                    console.log(group);
                    this.getGroupsByUser(message.user);
                }, (err) => next(err))
                .catch((err) => next(err));


            this.sendMessage(newMessage);
      });
    }

    signUp(user) {

        User.create({ username: user.userName, password : user.password}).then((newUser) => {
            console.log(newUser);
        });
    }

    getUser(user, fn) {
        User.find({ username: user }).then((userReturn) => {
            console.log(userReturn);
            let user = {
                username: userReturn[0].username,
                firstname: userReturn[0].firstname,
                lastname: userReturn[0].lastname,
                image: userReturn[0].image
            }
            console.log(user);
            fn(user);
        });
    }

    getChatGroup(userArray, fn) {
        userArray = _.uniq(userArray);
        //fn('return: ' + userArray);
        console.log("getChatGroup");
        console.log(userArray);
        ChatGroup.find({ users: { $all: userArray } }).then((group) => {
            console.log('group: ' + group);
            console.log(_.isEqual(group, []));
            
            if (_.isEqual(group, [])) {/// use upsert to create the document if not found instead of this
                ChatGroup.create({ users: userArray }).then((newGroup) => {
                    console.log(newGroup);
                    fn([newGroup]);
                });
            } else {
                fn(group);
            }
        });
    }

    getGroupsByUser(username) {
        console.log("getGroupsByUser: "+ username);
        ChatGroup.find({ users: { $in: [username] } })
            .sort({ 'updatedAt': -1 })
            .populate('lastMessage')
            .then((groups) => {
            console.log('GroupsByUser: ' + groups);
            this.sendGroups(groups);
        });
    }

    getSelfChatGroup(username, fn) {
        console.log("getSelfChatGroup");
        console.log(username);
        ChatGroup.find({ users: [username] }).then((group) => {
            console.log('group: ' + group);
            console.log(_.isEqual(group, []));

            if (_.isEqual(group, [])) {
                ChatGroup.create({ users: [username] }).then((newGroup) => {
                    console.log(newGroup);
                    fn([newGroup]);
                });
            } else {
                fn(group);
            }
        });
    }

    sendUser(user) {
        this.io.sockets.emit('user', user);
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