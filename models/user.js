var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//var passportLocalMongoose = require('passport-local-mongoose');

var User = new Schema({
    username: {
        type: String,
        default: ''
    },
    password: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        default: ''
    },
    image: {
        type: String,
        default: ''
    },
    admin: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

//User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);