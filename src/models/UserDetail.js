const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userDetailSchema = mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: false,
        trim: true
    },
    userName: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true
    },
    avatar: {
        type: String,
        required: true,
        default: 'assets/images/avatars/profile.jpg',
    },
    birthDay: {
        type: Date,
        required: false
    },
    address: {
        type: String,
        required: false,
        trim: true
    },
    aboutMe: {
        type: String,
        required: false,
        trim: true
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

userDetailSchema.pre('save', async function (next) {
    const user = this;

    next()
});

userDetailSchema.methods.generateUserName = async function() {
    const user = this;
    const userName = makeId();
    user.userName = userName;
    await user.save();
    return userName
};

userDetailSchema.statics.findByUserName = async (userName) => {
    const user = await UserDetail.findOne({ userName });
    if (!user) {
        throw new Error('Invalid user')
    }

    return user
};

userDetailSchema.statics.findByUser = async (id) => {
    const user = await UserDetail.find({ user: id });
    if (!user) {
        throw new Error('Invalid user')
    }

    return user
};

function makeId() {
    let result           = '';
    const characters       = 'abcdefghijklmnopqrstuvwxyz0123456789_';
    const charactersLength = characters.length;
    for ( let i = 0; i < 30; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

const UserDetail = mongoose.model('UserDetail', userDetailSchema);

module.exports = UserDetail;
