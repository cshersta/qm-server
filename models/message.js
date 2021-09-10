var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const uuidv4 = require('uuid').v4;
//var passportLocalMongoose = require('passport-local-mongoose');

var Message = new Schema({
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ChatGroup'
        //required: true
    },
    id: {
        type: String,
        default: uuidv4()
        //required: true
    },
    user: {
        //type: mongoose.Schema.Types.ObjectId,
        //ref: 'User',
        type: String,
        required: true 
    },
    text: {
        type: String,
        default: ''
    },
    time: {
        type: Number,
        default: Date.now()
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