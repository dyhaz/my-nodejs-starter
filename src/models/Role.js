const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const roleSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    description: String,
    permissions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Permission' }]
})

roleSchema.pre('save', async function (next) {
    const role = this
    next()
})

roleSchema.statics.findByName = async (name) => {
    // Search for a user by email and password.
    const role = await Role.findOne({ name} )
    if (!role) {
        throw new Error({ error: 'Invalid role' })
    }

    return role
}

roleSchema.statics.getAll = async () =>  {
    const roles = await Role.find({})
    if (!roles) {
        throw new Error({error: 'No data available'})
    }

    return roles
}

const Role = mongoose.model('Role', roleSchema)

module.exports = Role
