var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//var passportLocalMongoose = require('passport-local-mongoose');

var Message = new Schema({
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ChatGroup'
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    text: {
        type: String,
        default: ''
    },
    fwdFrom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

//User.plugin(passportLocalMongoose);

module.exports = mongoose.model('Message', Message);