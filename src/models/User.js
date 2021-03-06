const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserDetail = require('./UserDetail');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    photoURL: {
        type: String,
        required: true,
        default: 'assets/images/avatars/profile.jpg',
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        validate: value => {
            if (!validator.isEmail(value)) {
                throw new Error('Invalid Email address')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minLength: 7
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    roles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Role' }]
});

userSchema.pre('save', async function (next) {
    // Hash the password before saving the user model
    const user = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
});

userSchema.methods.generateAuthToken = async function() {
    // Generate an auth token for the user
    const user = this;
    const token = jwt.sign({_id: user._id}, process.env.JWT_KEY);
    user.tokens = user.tokens.concat({token});
    await user.save();
    return token
};

userSchema.statics.findByCredentials = async (email, password) => {
    // Search for a user by email and password.
    const user = await User.findOne({ email });
    if (!user) {
        const userDetail = await UserDetail.findByUserName(email);
        if (!userDetail || !userDetail.user || userDetail.user.email !== email) {
            throw new Error('Invalid login credentials')
        }
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
        throw new Error('Invalid login credentials')
    }

    return user
};

userSchema.statics.findByEmail = async (email) => {
    // Search for a user by email and password.
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error('Invalid user')
    }
    return user
};

userSchema.statics.updateByEmail = async (email, update) => {
    // Search for a user by email and password.
    const user = await User.findOneAndUpdate({ email }, update,{new: true});
    if (!user) {
        throw new Error('Invalid user')
    }
    return user
};

const User = mongoose.model('User', userSchema);

module.exports = User;
