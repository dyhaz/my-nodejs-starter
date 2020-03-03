const express = require('express')
const Role = require('../models/Role')
const Permission = require('../models/Permission')

const router = express.Router()
const auth = require('../middleware/auth')

router.post('/roles', async (req, res) => {
	try {
	    const role = new Role(req.body)
	    await role.save()
	    res.status(201).send({role})
	}  catch (error) {
	    res.status(400).send(error)
	}
})

router.get('/roles', async (req, res) => {
    try {
        const roles = await Role.getAll()
        res.status(200).send({roles})
    }  catch (error) {
        res.status(400).send(error)
    }
})

router.post('/roles/getByName', async(req, res) => {
	try {
	    const { name } = req.body
        const role = await Role.findByName(name)
        if (!role) {
            return res.status(500).send({error: 'Role not found'})
        }
        res.send({ role })
	} catch(error) {
	    res.status(500).send(error)
	}
})

router.post('/roles/deleteRole', async(req, res) => {
    try {
        const { name } = req.body
        const role = await Role.findByName(name)
        if (!role) {
            return res.status(500).send({error: 'Role not found'})
        }
        await role.delete()
        res.send({ role })
    } catch(error) {
        res.status(500).send('Internal Error')
    }
})

router.post('/roles/addPermission', async(req, res) => {
    try {
        const {roleName, permissionName} = req.body
        const role = await Role.findByName(roleName)

        if (!role) {
            return res.status(500).send({error: 'Role not found'})
        }
        const permission = await Permission.findByName(permissionName)
        if (!permission) {
            return res.status(500).send({error: 'Permission not found'})
        }
        role.permissions.push(permission)
        await role.save()
        res.status(201).send({role})
    } catch(error) {
        res.status(500).send('Internal Error')
    }
})

router.post('/roles/removePermission', async(req, res) => {
    try {
        const {roleName, permissionName} = req.body
        const role = await Role.findByName(roleName)
        if (!role) {
            return res.status(500).send({error: 'Role not found'})
        }
        const permission = await Permission.findByName(permissionName)
        if (!permission) {
            return res.status(500).send({error: 'Permission not found'})
        }
        // role.permissions.(permission)
        await role.save()
        res.status(204).send({role})
    } catch(error) {
        res.status(500).send('Internal Error')
    }
})

module.exports = router
