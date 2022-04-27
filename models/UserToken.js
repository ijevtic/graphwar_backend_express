const mongoose = require('mongoose');

const UserTokenSchema = mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    token: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('UserToken', UserTokenSchema);