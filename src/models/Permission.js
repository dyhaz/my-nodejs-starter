const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const permissionSchema = mongoose.Schema({
    read: { type: Boolean, default: false, required: true },
    write: { type: Boolean, default: false, required: true },
    delete: { type: Boolean, default: false, required: true },
    name : { type: String, required: true, unique: true }
});

permissionSchema.pre('save', async function (next) {
    const role = this;
    next()
});

permissionSchema.statics.findByName = async (name) => {
    // Search for a user by email and password.
    const permission = await Permission.findOne({ name} );
    if (!permission) {
        throw new Error('Invalid permission')
    }

    return permission
};

permissionSchema.statics.getAll = async () =>  {
    const permissions = await Permission.find({});
    if (!permissions) {
        throw new Error('No data available')
    }

    return permissions
};

const Permission = mongoose.model('Permission', permissionSchema);

module.exports = Permission;
